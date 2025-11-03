use soroban_sdk::{Address, Env};
use token_advanced_da240ce8::{MiContratoContract, ContractError};

pub fn deploy_contract(env: &Env, admin: Address) -> Result<(), ContractError> {
    let contract = MiContratoContract;
    
    contract.initialize(
        env.clone(),
        admin,
        "MiContrato".into(),
        "TOKEN".into(),
        2,
        1000
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_deploy() {
        let env = Env::default();
        let admin = Address::generate(&env);
        
        assert!(deploy_contract(&env, admin).is_ok());
    }
}