var entry = {
	user: {
		id: "55fa1a75b6b61f18130bede0",
	},
	account: {
		id: "55fa1a1567768a1f160e485e",
	},
	description: '1st Week Allowance',
	remarks: 'Some details to remember',
	amount: 1000,
	date: {
		used:'2015/09/01',
		created: '2015/09/01',
	},
};

var account = {
	id: null,
	name: 'LIV',
	description: 'Living Allowance',
};

var budget = {
	name: 'Sept',
	accounts: [
		{
			id: "55fa0e877b23a7079509e665",
			allocation: 1000
		},
		{
			id: "55fa1a1567768a1f160e485e",
			allocation: 1000
		},
	],
	date:{
		start: '2015/01/09',
		end: '2015/30/09'
	},
};

var user = {
	id: null,
	name: 'Marlo',
	active: true,
	settings: {
		budget: {
			id: null
		}
	},
};

// -------------------------
Welcome Sequence
Create a User account
Create Accounts list
Create Budget
	Assign Date of coverage
	Select Account
	Assign allocation
Assign Budget to User


// -------------------------
// User
{name:"Marlo", active:true, settings:{budget:{id:"5603b5656e6cd9208e06b068"}}}
// Accounts
{name:"LIV", description:"Living Allowance"}
{name:"CHR", description:"Church Tithes, Offering and Pledges"}
// Budgets
{
	name:"Sept", accounts:[{id:"5603b4d26e6cd916560ee677", allocation:2000}, {id:"5603b4fa6e6cd910ac08a5e7", allocation:1000}],
	date:{start:"2015/09/01", end:"2015/09/30"}
}
// Entries