// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DevGonPayment {
    address public owner;
    uint256 public postingFee;
    uint256 public platformFeePercentage;
    
    struct JobPosting {
        address developer;
        uint256 amount;
        uint256 timestamp;
        string jobId;
        bool active;
    }
    
    mapping(string => JobPosting) public jobPostings;
    mapping(address => uint256) public developerBalances;
    
    event JobPosted(address indexed developer, string jobId, uint256 amount, uint256 timestamp);
    event FeeUpdated(uint256 newFee);
    event Withdrawal(address indexed developer, uint256 amount);
    
    constructor(uint256 _postingFee) {
        owner = msg.sender;
        postingFee = _postingFee;
        platformFeePercentage = 5; // 5% platform fee
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function postJob(string memory jobId) public payable {
        require(msg.value >= postingFee, "Insufficient payment");
        require(!jobPostings[jobId].active, "Job already posted");
        
        jobPostings[jobId] = JobPosting({
            developer: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            jobId: jobId,
            active: true
        });
        
        emit JobPosted(msg.sender, jobId, msg.value, block.timestamp);
    }
    
    function updatePostingFee(uint256 _newFee) public onlyOwner {
        postingFee = _newFee;
        emit FeeUpdated(_newFee);
    }
    
    function updatePlatformFee(uint256 _newPercentage) public onlyOwner {
        require(_newPercentage <= 20, "Fee too high");
        platformFeePercentage = _newPercentage;
    }
    
    function deactivateJob(string memory jobId) public {
        require(jobPostings[jobId].developer == msg.sender || msg.sender == owner, "Not authorized");
        jobPostings[jobId].active = false;
    }
    
    function withdrawPlatformFees() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner).transfer(balance);
    }
    
    function getJobPosting(string memory jobId) public view returns (
        address developer,
        uint256 amount,
        uint256 timestamp,
        bool active
    ) {
        JobPosting memory job = jobPostings[jobId];
        return (job.developer, job.amount, job.timestamp, job.active);
    }
    
    function getPostingFee() public view returns (uint256) {
        return postingFee;
    }
}
