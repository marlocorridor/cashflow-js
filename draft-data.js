var entry = {
	user: {
		id: "55fa1a75b6b61f18130bede0",
	},
	account: {
		id: "55fa1a1567768a1f160e485e",
	},
	description: '1st Week Allowance',
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