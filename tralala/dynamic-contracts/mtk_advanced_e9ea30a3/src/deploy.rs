use soroban_sdk::{Address, Env};
use mtk_advanced_e9ea30a3::{MyTokenContract, ContractError};

pub fn deploy_contract(env: &Env, admin: Address) -> Result<(), ContractError> {
    let contract = MyTokenContract;
    
    contract.initialize(
        env.clone(),
        admin,
        "MyToken".into(),
        "MTK".into(),
        2,
        1
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