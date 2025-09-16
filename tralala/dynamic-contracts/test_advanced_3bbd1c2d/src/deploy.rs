use soroban_sdk::{Address, Env};
use test_advanced_3bbd1c2d::{TestTokenContract, ContractError};

pub fn deploy_contract(env: &Env, admin: Address) -> Result<(), ContractError> {
    let contract = TestTokenContract;
    
    contract.initialize(
        env.clone(),
        admin,
        "Test Token".into(),
        "TEST".into(),
        2,
        1000000
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