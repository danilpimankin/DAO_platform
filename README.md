# Main information
Platform address : [0xE793f9229eAc4693E2Bbcb9549f264445d0DEed9](https://mumbai.polygonscan.com/address/0xE793f9229eAc4693E2Bbcb9549f264445d0DEed9#code)

DAO token: [0x50d7222306D973E4347f67Ef701b6718e07f0783](https://mumbai.polygonscan.com/address/0x50d7222306D973E4347f67Ef701b6718e07f0783#code)

calldata example: 0x40c10f190000000000000000000000005b38da6a701c568545dcfcb03fcb875f56beddc400000000000000000000000000000000000000000052b7d2dcc80cd2e4000000


## Installation
Clone the repository and install the dependencies using the following command:
```
npm i
```

## Deployment
Fill in the .env file and use the command:
```
npx hardhat run scripts/deploy.ts --network polygon-mumbai
```

## Task Running
Running a buy token task: 
```
npx hardhat deposit --amount 100000000000000000000 --network polygon-mumbai
```
## Test Running
Running contract tests: 
```
npx hardhat test
```
![test screenshot](https://github.com/danilpimankin/DAO_platform/blob/main/screenshot.png)