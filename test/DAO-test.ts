import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { increase } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time";

describe("DAO contract", function () {

  let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, users: SignerWithAddress[];

  let DAOplatform, DAOtoken, CallableToken;
  let daoToken: Contract;
  let platform: Contract; 
  let callableToken: Contract; 

  let votingDuration = 14 * 24 * 60 * 60
  let callData = "0x40c10f190000000000000000000000005b38da6a701c568545dcfcb03fcb875f56beddc400000000000000000000000000000000000000000052b7d2dcc80cd2e4000000"

  beforeEach(async () => {
    [owner, user1, user2, ...users] = await ethers.getSigners();

    //deploy a test DAO token

    DAOtoken = await ethers.getContractFactory('MyToken');
    daoToken = await DAOtoken.deploy("ICO token", "ICO");

    //deploy the main contract
    DAOplatform = await ethers.getContractFactory('DAO');
    platform = await DAOplatform.deploy(votingDuration, daoToken.address);

    //deploy a test Callable token
    CallableToken = await ethers.getContractFactory('CallebleToken');
    callableToken = await CallableToken.deploy("Callable Token", "CTK", platform.address);

    const startTime = await time.latest()
    //mint tokens to the platform and a random user
    await daoToken.mint(platform.address, ethers.utils.parseEther("1000"))

  })

  describe("Functionality test", async () => {
    it("test. Normal interaction with the platform", async () => {
      await daoToken.mint(user1.address, ethers.utils.parseEther("2000"));
      await daoToken.connect(user1).approve(platform.address, ethers.utils.parseEther("2000"));
      await expect(platform.addProposal(callData, callableToken.address))
        .to.emit(platform, "AddProposal")
        .withArgs(0, callData, callableToken.address);
      await expect(platform.connect(user1).addDeposit(ethers.utils.parseEther("2000")))
        .to.emit(platform, "AddedDeposit")
        .withArgs(user1.address, ethers.utils.parseEther("2000"))
      await expect(platform.connect(user1).vote(0, true))
        .to.emit(platform, "Voted")
        .withArgs(user1.address, ethers.utils.parseEther("2000"), true, 0)
      await time.increase(votingDuration)
      await expect(platform.finishProposal(0))
        .to.emit(platform, "FinishProposal")
        .withArgs(0, true, true, true)
      await expect(platform.connect(user1).withdrawDeposit(ethers.utils.parseEther("1000")))
        .to.emit(platform, "WithdrawedDeposit")
        .withArgs(user1.address, ethers.utils.parseEther("1000"))
      expect(await callableToken.balanceOf("0x5b38da6a701c568545dcfcb03fcb875f56beddc4")).to.be.eq(ethers.utils.parseEther("100000000"))
    })

    describe("Vote tests", async () => {
        it("test 1. Vote without deposit", async () => {
          await platform.addProposal(callData, callableToken.address)
          await expect(platform.connect(user1).vote(0, true))
            .to.be.revertedWith("DAO: not enough tokens")
        })

        it("test 2. Double vote to a same proposal", async () => {
          await daoToken.mint(user1.address, ethers.utils.parseEther("2000"))
          await daoToken.connect(user1).approve(platform.address, ethers.utils.parseEther("2000"))

          await platform.connect(user1).addDeposit(ethers.utils.parseEther("1000"))
          await platform.addProposal(callData, callableToken.address)
          await platform.connect(user1).vote(0, true)
          await platform.connect(user1).addDeposit(ethers.utils.parseEther("1000"))

          await expect(platform.connect(user1).vote(0, true))
            .to.be.revertedWith("DAO: You already voted")
        })
        
        it("test 3. Vote after the end of a proposal", async () => {
          await daoToken.mint(user1.address, ethers.utils.parseEther("2000"))
          await daoToken.connect(user1).approve(platform.address, ethers.utils.parseEther("2000"))
          await platform.connect(user1).addDeposit(ethers.utils.parseEther("1000"))
          await platform.addProposal(callData, callableToken.address)
          await time.increase(votingDuration)
          await expect(platform.connect(user1).vote(0, true))
            .to.be.revertedWith("DAO: Voting has ended")
        })

    })

    describe("FinishProposal tests", async () => {
        it("test 1. FinishProposal without 1/2 tokens", async () => {
          await daoToken.mint(user1.address, ethers.utils.parseEther("2000"))
          await daoToken.connect(user1).approve(platform.address, ethers.utils.parseEther("2000"))
          await platform.connect(user1).addDeposit(ethers.utils.parseEther("1000"))
          await platform.addProposal(callData, callableToken.address)
          await platform.connect(user1).vote(0, true)
          await time.increase(votingDuration)
          await expect(platform.connect(user1).finishProposal(0))
            .to.emit(platform, "FinishProposal")
            .withArgs(0, false, true, false)
        })
        
    })
  })
})

