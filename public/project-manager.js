/**
 * PROJECT MANAGER
 * Saves and loads smart contract projects in localStorage
 */

class ProjectManager {
    constructor(storageName = 'tralalero_projects') {
        this.storageName = storageName;
        this.maxProjects = 10;
    }

    /**
     * Saves a project to localStorage
     */
    saveProject(name, blocklyWorkspace) {
        try {
            if (!name || name.trim() === '') {
                throw new Error('Project name cannot be empty');
            }

            if (!blocklyWorkspace) {
                throw new Error('Blockly workspace is not available');
            }

            // Get the XML from the workspace
            const xml = Blockly.Xml.workspaceToDom(blocklyWorkspace);
            const xmlText = Blockly.Xml.domToText(xml);

            // Get existing projects
            const projects = this.getAllProjects();

            // Create a new project
            const project = {
                id: this.generateId(),
                name: name.trim(),
                timestamp: new Date().toISOString(),
                xml: xmlText,
                version: '1.0'
            };

            // Add or update the project
            const existingIndex = projects.findIndex(p => p.name === name);
            if (existingIndex >= 0) {
                projects[existingIndex] = project;
            } else {
                projects.push(project);
            }

            // Limit the number of projects
            if (projects.length > this.maxProjects) {
                projects.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                projects.splice(this.maxProjects);
            }

            // Save to localStorage
            localStorage.setItem(this.storageName, JSON.stringify(projects));

            console.log(`✅ Project '${name}' saved successfully`);
            return project;
        } catch (error) {
            console.error('❌ Error saving project:', error);
            throw error;
        }
    }

    /**
     * Loads a project from localStorage
     */
    loadProject(nameOrId, blocklyWorkspace) {
        try {
            if (!blocklyWorkspace) {
                throw new Error('Blockly workspace is not available');
            }

            const projects = this.getAllProjects();
            let project = projects.find(p => p.name === nameOrId || p.id === nameOrId);

            if (!project) {
                throw new Error(`Project '${nameOrId}' not found`);
            }

            // Clear workspace
            blocklyWorkspace.clear();

            // Load XML
            const xml = Blockly.Xml.textToDom(project.xml);
            Blockly.Xml.domToWorkspace(xml, blocklyWorkspace);

            console.log(`✅ Project '${project.name}' loaded successfully`);
            return project;
        } catch (error) {
            console.error('❌ Error loading project:', error);
            throw error;
        }
    }

    /**
     * Gets all saved projects
     */
    getAllProjects() {
        try {
            const data = localStorage.getItem(this.storageName);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('❌ Error reading projects:', error);
            return [];
        }
    }

    /**
     * Gets a project by name or ID
     */
    getProject(nameOrId) {
        const projects = this.getAllProjects();
        return projects.find(p => p.name === nameOrId || p.id === nameOrId);
    }

    /**
     * Deletes a project
     */
    deleteProject(nameOrId) {
        try {
            let projects = this.getAllProjects();
            const initialLength = projects.length;

            projects = projects.filter(p => p.name !== nameOrId && p.id !== nameOrId);

            if (projects.length === initialLength) {
                throw new Error(`Project '${nameOrId}' not found`);
            }

            localStorage.setItem(this.storageName, JSON.stringify(projects));
            console.log(`✅ Project '${nameOrId}' deleted`);
            return true;
        } catch (error) {
            console.error('❌ Error deleting project:', error);
            throw error;
        }
    }

    /**
     * Renames a project
     */
    renameProject(oldName, newName, blocklyWorkspace) {
        try {
            if (!newName || newName.trim() === '') {
                throw new Error('The new name cannot be empty');
            }

            const projects = this.getAllProjects();
            const project = projects.find(p => p.name === oldName);

            if (!project) {
                throw new Error(`Project '${oldName}' not found`);
            }

            // Check if the new name already exists
            if (projects.some(p => p.name === newName && p.id !== project.id)) {
                throw new Error(`A project named '${newName}' already exists`);
            }

            project.name = newName.trim();

            // If there is a workspace, update the XML as well
            if (blocklyWorkspace) {
                const xml = Blockly.Xml.workspaceToDom(blocklyWorkspace);
                project.xml = Blockly.Xml.domToText(xml);
            }

            localStorage.setItem(this.storageName, JSON.stringify(projects));
            console.log(`✅ Project renamed to '${newName}'`);
            return project;
        } catch (error) {
            console.error('❌ Error renaming project:', error);
            throw error;
        }
    }

    /**
     * Exports a project as JSON
     */
    exportProject(nameOrId) {
        try {
            const project = this.getProject(nameOrId);

            if (!project) {
                throw new Error(`Project '${nameOrId}' not found`);
            }

            const json = JSON.stringify(project, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name}.json`;
            a.click();
            URL.revokeObjectURL(url);

            console.log(`✅ Project exported: ${project.name}.json`);
            return true;
        } catch (error) {
            console.error('❌ Error exporting project:', error);
            throw error;
        }
    }

    /**
     * Imports a project from JSON
     */
    importProject(jsonFile, blocklyWorkspace) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();

                reader.onload = (e) => {
                    try {
                        const project = JSON.parse(e.target.result);

                        // Validate structure
                        if (!project.name || !project.xml) {
                            throw new Error('Invalid project format');
                        }

                        // Save project
                        const saved = this.saveProject(project.name, blocklyWorkspace);

                        // Load into workspace
                        if (blocklyWorkspace) {
                            const xml = Blockly.Xml.textToDom(project.xml);
                            blocklyWorkspace.clear();
                            Blockly.Xml.domToWorkspace(xml, blocklyWorkspace);
                        }

                        console.log(`✅ Project imported: ${project.name}`);
                        resolve(saved);
                    } catch (error) {
                        reject(new Error(`Error importing project: ${error.message}`));
                    }
                };

                reader.onerror = () => {
                    reject(new Error('Error reading file'));
                };

                reader.readAsText(jsonFile);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Clears all projects
     */
    clearAll() {
        try {
            localStorage.removeItem(this.storageName);
            console.log('✅ All projects deleted');
            return true;
        } catch (error) {
            console.error('❌ Error clearing projects:', error);
            throw error;
        }
    }

    /**
     * Gets storage usage information
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
     * Generates a unique ID
     */
    generateId() {
        return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Creates an HTML list of projects
     */
    getProjectsListHTML() {
        const projects = this.getAllProjects();

        if (projects.length === 0) {
            return '<p style="color: #6b7280;">No saved projects</p>';
        }

        let html = '<div style="display: grid; gap: 0.75rem;">';

        projects.forEach(project => {
            const date = new Date(project.timestamp).toLocaleString();
            html += `
                <div style="background: #f9fafb; padding: 0.75rem; border-radius: 0.5rem; border-left: 3px solid #3b82f6;">
                    <div style="font-weight: 600; color: #1f2937;">${project.name}</div>
                    <div style="font-size: 0.85rem; color: #6b7280; margin-top: 0.25rem;">
                        Saved: ${date}
                    </div>
                    <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                        <button onclick="projectManager.loadProject('${project.id}', blocklyWorkspace); updateCodePreview();"
                                style="background: #3b82f6; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.85rem;">
                            Load
                        </button>
                        <button onclick="projectManager.deleteProject('${project.id}'); location.reload();"
                                style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.85rem;">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }
}

// Create global instance
const projectManager = new ProjectManager();

console.log('✅ Project manager loaded successfully');
