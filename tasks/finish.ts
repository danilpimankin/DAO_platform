import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('finish', 'Finish a proposal')
    .addParam('id', 'proposal id')
	.setAction(async ({ id }, { ethers }) => {
        let platform = "0xE793f9229eAc4693E2Bbcb9549f264445d0DEed9"

        const Platform = await ethers.getContractFactory('DAO')
        const daoPlatform = Platform.attach(platform)
        try{ 
            const contractTx2: ContractTransaction = await daoPlatform.finishProposal(id);
            const contractReceipt: ContractReceipt = await contractTx2.wait();
            const event = contractReceipt.events?.find(event => event.event === 'FinishProposal');
            const eID: BigNumber = event?.args!['pId'];  
            const eQuorum: Boolean = event?.args!['quorum'];  
            const eResult: Boolean = event?.args!['result'];
            const eSuccess: Boolean = event?.args!['success'];  
            if(eSuccess){      
                console.log(`Proposal with ${eID} id successful finished!`)
            } else{
                console.log(`Proposal with ${eID} id UNsuccessful finished because Quorum = ${eQuorum} or/and Result = ${eResult}`)
            }
        } catch(error: any) {
            console.log("ERROR:", error["reason"]);
        }
    })