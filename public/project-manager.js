/**
 * GESTOR DE PROYECTOS
 * Guarda y carga proyectos de smart contracts en localStorage
 */

class ProjectManager {
    constructor(storageName = 'tralalero_projects') {
        this.storageName = storageName;
        this.maxProjects = 10;
    }

    /**
     * Guarda un proyecto en localStorage
     */
    saveProject(name, blocklyWorkspace) {
        try {
            if (!name || name.trim() === '') {
                throw new Error('El nombre del proyecto no puede estar vacío');
            }

            if (!blocklyWorkspace) {
                throw new Error('El workspace de Blockly no está disponible');
            }

            // Obtener el XML del workspace
            const xml = Blockly.Xml.workspaceToDom(blocklyWorkspace);
            const xmlText = Blockly.Xml.domToText(xml);

            // Obtener proyectos existentes
            const projects = this.getAllProjects();

            // Crear nuevo proyecto
            const project = {
                id: this.generateId(),
                name: name.trim(),
                timestamp: new Date().toISOString(),
                xml: xmlText,
                version: '1.0'
            };

            // Agregar o actualizar proyecto
            const existingIndex = projects.findIndex(p => p.name === name);
            if (existingIndex >= 0) {
                projects[existingIndex] = project;
            } else {
                projects.push(project);
            }

            // Limitar cantidad de proyectos
            if (projects.length > this.maxProjects) {
                projects.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                projects.splice(this.maxProjects);
            }

            // Guardar en localStorage
            localStorage.setItem(this.storageName, JSON.stringify(projects));

            console.log(`✅ Proyecto '${name}' guardado correctamente`);
            return project;
        } catch (error) {
            console.error('❌ Error guardando proyecto:', error);
            throw error;
        }
    }

    /**
     * Carga un proyecto desde localStorage
     */
    loadProject(nameOrId, blocklyWorkspace) {
        try {
            if (!blocklyWorkspace) {
                throw new Error('El workspace de Blockly no está disponible');
            }

            const projects = this.getAllProjects();
            let project = projects.find(p => p.name === nameOrId || p.id === nameOrId);

            if (!project) {
                throw new Error(`Proyecto '${nameOrId}' no encontrado`);
            }

            // Limpiar workspace
            blocklyWorkspace.clear();

            // Cargar XML
            const xml = Blockly.Xml.textToDom(project.xml);
            Blockly.Xml.domToWorkspace(xml, blocklyWorkspace);

            console.log(`✅ Proyecto '${project.name}' cargado correctamente`);
            return project;
        } catch (error) {
            console.error('❌ Error cargando proyecto:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los proyectos guardados
     */
    getAllProjects() {
        try {
            const data = localStorage.getItem(this.storageName);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('❌ Error leyendo proyectos:', error);
            return [];
        }
    }

    /**
     * Obtiene un proyecto por nombre o ID
     */
    getProject(nameOrId) {
        const projects = this.getAllProjects();
        return projects.find(p => p.name === nameOrId || p.id === nameOrId);
    }

    /**
     * Elimina un proyecto
     */
    deleteProject(nameOrId) {
        try {
            let projects = this.getAllProjects();
            const initialLength = projects.length;

            projects = projects.filter(p => p.name !== nameOrId && p.id !== nameOrId);

            if (projects.length === initialLength) {
                throw new Error(`Proyecto '${nameOrId}' no encontrado`);
            }

            localStorage.setItem(this.storageName, JSON.stringify(projects));
            console.log(`✅ Proyecto '${nameOrId}' eliminado`);
            return true;
        } catch (error) {
            console.error('❌ Error eliminando proyecto:', error);
            throw error;
        }
    }

    /**
     * Renombra un proyecto
     */
    renameProject(oldName, newName, blocklyWorkspace) {
        try {
            if (!newName || newName.trim() === '') {
                throw new Error('El nuevo nombre no puede estar vacío');
            }

            const projects = this.getAllProjects();
            const project = projects.find(p => p.name === oldName);

            if (!project) {
                throw new Error(`Proyecto '${oldName}' no encontrado`);
            }

            // Verificar que el nuevo nombre no exista
            if (projects.some(p => p.name === newName && p.id !== project.id)) {
                throw new Error(`Ya existe un proyecto llamado '${newName}'`);
            }

            project.name = newName.trim();

            // Si hay un workspace, actualizar el XML también
            if (blocklyWorkspace) {
                const xml = Blockly.Xml.workspaceToDom(blocklyWorkspace);
                project.xml = Blockly.Xml.domToText(xml);
            }

            localStorage.setItem(this.storageName, JSON.stringify(projects));
            console.log(`✅ Proyecto renombrado a '${newName}'`);
            return project;
        } catch (error) {
            console.error('❌ Error renombrando proyecto:', error);
            throw error;
        }
    }

    /**
     * Exporta un proyecto como JSON
     */
    exportProject(nameOrId) {
        try {
            const project = this.getProject(nameOrId);

            if (!project) {
                throw new Error(`Proyecto '${nameOrId}' no encontrado`);
            }

            const json = JSON.stringify(project, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name}.json`;
            a.click();
            URL.revokeObjectURL(url);

            console.log(`✅ Proyecto exportado: ${project.name}.json`);
            return true;
        } catch (error) {
            console.error('❌ Error exportando proyecto:', error);
            throw error;
        }
    }

    /**
     * Importa un proyecto desde JSON
     */
    importProject(jsonFile, blocklyWorkspace) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();

                reader.onload = (e) => {
                    try {
                        const project = JSON.parse(e.target.result);

                        // Validar estructura
                        if (!project.name || !project.xml) {
                            throw new Error('Formato de proyecto inválido');
                        }

                        // Guardar proyecto
                        const saved = this.saveProject(project.name, blocklyWorkspace);

                        // Cargar en workspace
                        if (blocklyWorkspace) {
                            const xml = Blockly.Xml.textToDom(project.xml);
                            blocklyWorkspace.clear();
                            Blockly.Xml.domToWorkspace(xml, blocklyWorkspace);
                        }

                        console.log(`✅ Proyecto importado: ${project.name}`);
                        resolve(saved);
                    } catch (error) {
                        reject(new Error(`Error importando proyecto: ${error.message}`));
                    }
                };

                reader.onerror = () => {
                    reject(new Error('Error leyendo archivo'));
                };

                reader.readAsText(jsonFile);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Limpia todos los proyectos
     */
    clearAll() {
        try {
            localStorage.removeItem(this.storageName);
            console.log('✅ Todos los proyectos eliminados');
            return true;
        } catch (error) {
            console.error('❌ Error limpiando proyectos:', error);
            throw error;
        }
    }

    /**
     * Obtiene información de uso de storage
     */
    getStorageInfo() {
        const projects = this.getAllProjects();
        const storageUsed = JSON.stringify(projects).length;
        const storageLimit = 5242880; // 5MB

        return {
            projectCount: projects.length,
            storageUsed: storageUsed,
            storageLimit: storageLimit,
            percentageUsed: ((storageUsed / storageLimit) * 100).toFixed(2)
        };
    }

    /**
     * Genera un ID único
     */
    generateId() {
        return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Crea un listado HTML de proyectos
     */
    getProjectsListHTML() {
        const projects = this.getAllProjects();

        if (projects.length === 0) {
            return '<p style="color: #6b7280;">No hay proyectos guardados</p>';
        }

        let html = '<div style="display: grid; gap: 0.75rem;">';

        projects.forEach(project => {
            const date = new Date(project.timestamp).toLocaleString();
            html += `
                <div style="background: #f9fafb; padding: 0.75rem; border-radius: 0.5rem; border-left: 3px solid #3b82f6;">
                    <div style="font-weight: 600; color: #1f2937;">${project.name}</div>
                    <div style="font-size: 0.85rem; color: #6b7280; margin-top: 0.25rem;">
                        Guardado: ${date}
                    </div>
                    <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                        <button onclick="projectManager.loadProject('${project.id}', blocklyWorkspace); updateCodePreview();"
                                style="background: #3b82f6; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.85rem;">
                            Cargar
                        </button>
                        <button onclick="projectManager.deleteProject('${project.id}'); location.reload();"
                                style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.85rem;">
                            Eliminar
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }
}

// Crear instancia global
const projectManager = new ProjectManager();

console.log('✅ Gestor de proyectos cargado correctamente');
