// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;
 
interface IERC20 {
    function transfer(address, uint256) external returns(bool);
    function transferFrom(address, address, uint256) external returns(bool);
    function totalSupply() external view returns (uint256);
}

/// @title DAO contract. 
contract DAO{

    ///Структура депозита
    struct Deposit{
        uint256 allToken;
        uint256 frozenToken;
        uint256 unfrozenTime;
    }

    ///Структура голосования
    struct Proposal{
        uint256 pEndTime;
        uint256 pTokenYes;
        uint256 pTokenNo;
        address pCallAddress;
        bool pStatus;
        bytes pCallData;
    }
 
    ///интерфейс к токену управления права голоса
    IERC20 public TOD;
    ///время, отводимое для голосования
    uint256 time;
    ///Адрес хозяина контракта, который может создавать голосования
    address owner;
 
    ///массив структур Proposal - каждый элемент этого массива - отдельное голосование
    Proposal[] allProposals;
 
    ///Список проголосовавших
    mapping(uint256 => mapping(address => bool)) voters;
    ///депозиты
    mapping(address => Deposit) deposits;
 
    ///Events 
    event AddProposal(uint256 indexed pId, bytes pCallData, address indexed pCallAddres);
    event FinishProposal(uint256 indexed pId, bool quorum, bool result, bool success);
    event Voted(address indexed voter, uint256 tokenAmount, bool choice, uint256 indexed pId);
    event AddedDeposit(address indexed sender, uint256 tokenAmount);
    event WithdrawedDeposit(address indexed sender, uint256 tokenAmount);
 
    /// @notice конструктор
    /// @param _time - время отведенное на одно голосование
    /// @param _TOD - адрес токена для голосование
    constructor(uint256 _time, address _TOD){
        TOD = IERC20(_TOD);
        time = _time;
        owner = msg.sender;
    }
 
    /// @notice функция добавления депозита
    /// @param _amount - количество токенов, добавленных в депозит
    function addDeposit(uint256 _amount) external {
        deposits[msg.sender].allToken += _amount;
        require(TOD.transferFrom(msg.sender, address(this), _amount));
        emit AddedDeposit(msg.sender, _amount);
    }
 
    /// @notice функция вывода депозита
    /// @param _amount - количество токенов, выводимых из депозита
    function withdrawDeposit(uint256 _amount) external {
        Deposit storage deposit = deposits[msg.sender];
        if(deposit.frozenToken > 0 && block.timestamp > deposit.unfrozenTime){
            deposit.frozenToken = 0;
            deposit.unfrozenTime = 0;
        }
        require(deposit.allToken - deposit.frozenToken >= _amount, "DAO: Not enough unfrozen tokens!");
        deposit.allToken -= _amount;
        require(TOD.transfer(msg.sender, _amount));
        emit WithdrawedDeposit(msg.sender, _amount);
    }
 
    /// @notice функция добавления нового голосования
    /// @param _callData - закодированные сигнатура функции и аргументы
    /// @param _callAddress - адрес вызываемого контракта
    function addProposal(bytes calldata _callData, address _callAddress) external {
        require(msg.sender == owner, "DAO: You are not an owner!");
        allProposals.push(Proposal(
            block.timestamp + time,
            0,
            0,
            _callAddress,
            false,
            _callData
        ));
        emit AddProposal(allProposals.length - 1, _callData, _callAddress);
    }
 
    /// @notice Функция голосования
    /// @param _pId - id голосования
    /// @param _choice - голос за или против
    function vote(uint256 _pId, bool _choice) external {
        Deposit storage deposit = deposits[msg.sender];
        Proposal storage proposal = allProposals[_pId];
        uint256 totalTokensSupply = deposit.allToken - deposit.frozenToken;
        require(totalTokensSupply > 0, "DAO: not enough tokens");
        require(!voters[_pId][msg.sender], "DAO: You already voted");
        require(block.timestamp < proposal.pEndTime, "DAO: Voting has ended");
 
        voters[_pId][msg.sender] = true;
 
        if(_choice){
            proposal.pTokenYes += totalTokensSupply;
        }
        else{
            proposal.pTokenNo += totalTokensSupply;
        }
 
        deposit.frozenToken += totalTokensSupply;
 
        if(proposal.pEndTime > deposit.unfrozenTime){
            deposit.unfrozenTime = proposal.pEndTime;
        }
        emit Voted(msg.sender, totalTokensSupply, _choice, _pId);
    }
 
    /// @notice Функция окончания голосования
    /// @param _pId - id голосования
    function finishProposal(uint256 _pId) external {
        Proposal storage proposal = allProposals[_pId];
        require(block.timestamp > proposal.pEndTime, "DAO: Voting hasn't ended");
        require(!proposal.pStatus, "DAO: Voting has already finished");
 
        proposal.pStatus = true;
 
        bool quorum = proposal.pTokenYes + proposal.pTokenNo > TOD.totalSupply() / 2;
        bool result = proposal.pTokenYes > proposal.pTokenNo;
        bool success = false;
        if(quorum && result){
            (success, ) = proposal.pCallAddress.call(proposal.pCallData);
            require(success);
        }
 
        emit FinishProposal(_pId, quorum, result, success);
    }
 
    /// @notice функция для получения информации о депозите
    /// @return возвращает структуру deposit с информацией о депозите пользователя, вызвавшего функцию
    function getDeposit() external view returns(Deposit memory) {
        return deposits[msg.sender];
    }
 
    /// @notice Функция для получения списка всех голосований
    /// @return возвращает массив allProposals со всеми голосованиями
    function getAllProposal() external view returns(Proposal[] memory) {
        return allProposals;
    }
 
    /// @notice Функция для получения информации об одном голосовании по его id
    /// @param _pId - id голосования
    /// @return возвращает одно голосование - структуру Proposal
    function getProposalByID(uint256 _pId) external view returns(Proposal memory){
        return allProposals[_pId];
    }

    receive() external payable {}
}