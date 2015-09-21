var Cashflow = {
	namespaces: {},
};

/**
 * Global namespace definitions
 */
(function() {

    /**
     * Registers a namespace with the Cashflow module
     * @param namespace String
     * @param definition Object
     * @return void
     */
    Cashflow.registerNamespace = function(namespace, definition) {
        if (Cashflow.hasOwnProperty(namespace)) {
            throw 'namespace ' + namespace + ' is already registered';
        }
        Cashflow[namespace] = definition;
    };

    Cashflow.registerNamespace('classes', {
        app:{},
        db:{},
        template:{},
    });

    Cashflow.registerNamespace('global', {
    	constants:{},
    	functions:{},
    });

})();

(function () {
	// Constants
	Cashflow.global.constants = {
		dateFormat: 'yyyy/mm/dd',
	};

	// Functions
	Cashflow.global.functions.sumArray = function ( values ) {
		if( !values.length ){
			return 0;
		}
		return values[0] + this.sumArray( values.slice(1) );
	};

	// Classes
	Cashflow.classes.app.ApplicationClass = function () {
		this.init = function () {};
	};

	Cashflow.classes.db.TableClass = function ( tablename ) {
		this.db = Scule.factoryCollection( 'scule+local://' + tablename );
		// this.db.setAutoCommit(true);
	};

	Cashflow.classes.template.RendererClass = function ( template_id ) {
		this.template = {
			selector: "#" + template_id,
		};
	};

	Cashflow.classes.app.Account = function ( budgets, users, entries ) {
		Cashflow.classes.db.TableClass.call(this, 'account');

		// App Instances
		this.budgets = budgets;
		this.users   = users;
		this.entries = entries;

		// Template Setting
		this.template = {
			list: {
				src: "#account-summary-template",
				target: ".account-list",
			},
			detail: {
				src: "#account-detail-template",
				target: null,
			},
		};

		// setup method called after definition
		this.setup = function () {
			// prepare accounts summary
			var accounts = this.db.findAll(),
				budget   = this.getBudget();
			this.assignAccountsAllocation( accounts, budget );
			this.assignAccountsTotalExpense( accounts, budget );

			// render account summary list
			var template_str = $( this.template.list.src ).html(),
				target_elem  = $( this.template.list.target );
			
			target_elem.html(
				this.renderAccountList( template_str, target_elem, accounts )
			);

			return target_elem;
		};

		this.assignAccountsAllocation = function ( accounts, budget ) {
			if ( accounts.length == 0 ) {
				return;
			};

			// assign allocation
			accounts[0].allocation = 
				this.getBudgetAllocation( budget.accounts, accounts[0] );

			// recursive call
			return this.assignAccountsAllocation(
				accounts.slice(1),
				budget
			);
		};

		this.assignAccountsTotalExpense = function ( accounts, budget ) {
			if ( accounts.length == 0 ) {
				return;
			};

			var account_budget_entries = this.entries.findAccountBudgetRange(
				accounts[0].id,
				budget.date.start,
				budget.date.end
			);

			// assign total expense
			accounts[0].total_expense = 
				this.entries.getAmountSum( account_budget_entries );

			// recursive call
			return this.assignAccountsTotalExpense(
				accounts.slice(1),
				budget
			);
		};

		this.renderAccountList = function ( template_str, target_elem, accounts ) {
			var rendered_str = '';

			accounts.forEach(function ( account ) {
				var tmp_str = "";
				tmp_str = template_str
					.replace( /{{account.id}}/g, account.id )
					.replace( /{{account.name}}/g, account.name )
					.replace( /{{account.allocation}}/g, account.allocation )
					.replace( /{{account.total_expense}}/g, account.total_expense )
					.replace( /{{account.balance}}/g, account.allocation - account.total_expense );
				rendered_str += tmp_str;
			});

			// clean rendered string - remove unrendered fields
			// rendered_str = rendered_str.replace( /{{[\S]+}}/,'' );

			return rendered_str;
		};

		this.showAccountEntryList = function ( account_id, target_elem ) {
			var budget  = this.getBudget();
			var entries = this.entries.findAccountBudgetRange(
				account_id,
				budget.date.start,
				budget.date.end
			);

			var template_str = $(this.template.detail.src).html();
			target_elem.html(
				this.renderEntriesList( template_str, target_elem, entries )
			);

			return target_elem;
		};

		this.renderEntriesList = function ( template_str, target_elem, entries ) {
			var rendered_str = '';

			entries.forEach(function ( entry ) {
				var tmp_str = "";
				tmp_str = template_str
					.replace( /{{entry.id}}/g, entry._id )
					.replace( /{{entry.description}}/g, entry.description )
					.replace( /{{entry.amount}}/g, entry.amount )
				rendered_str += tmp_str;
			});

			// clean rendered string - remove unrendered fields
			// rendered_str = rendered_str.replace( /{{[\S]+}}/,'' );

			return rendered_str;
		};

		this.getBudgetAllocation = function ( budget_accounts, account ) {
			if ( !budget_accounts.length ) {
				return 0;
			};

			var current_budget = budget_accounts[0];
			if ( current_budget.id == account.id ) {
				return current_budget.allocation;
			}else{
				// recursive call
				return this.getBudgetAllocation(
					budget_accounts.slice(1),
					account
				);
			}
		};

		this.getBudget = function () {
			return this.budgets.getBudget( this.users.getActiveUserSettings('budget').id );
		};

		// call to setup method
		this.setup();
	};

	Cashflow.classes.app.Entry = function () {
		Cashflow.classes.db.TableClass.call(this, 'entry');

		// Template Setting
		this.template = {
			list: {
				src: "#account-detail-template",
				target: null,
			},
		};

		this.getEntry = function ( entry_id ) {
			return this.db.findOne( entry_id );
		}

		this.findBudgetRange = function ( start_date, end_date ) {
			return this.db.find({
				'date.used':{
					$gte: start_date,
					$lte: end_date
				}
			});
		};

		this.findAccountBudgetRange = function ( account_id, start_date, end_date ) {
			return this.db.find({
				'account.id': account_id,
				'date.used': {
					$gte: start_date,
					$lte: end_date
				}
			});
		};

		this.getAmountSum = function ( entries ) {
			if( !entries.length ){
				return 0;
			}
			return entries[0].amount + this.getAmountSum( entries.slice(1) );
		};
	};

	Cashflow.classes.app.Budget = function () {
		Cashflow.classes.db.TableClass.call(this, 'budget');

		this.getBudget = function ( budget_id ) {
			return this.db.findOne( budget_id );
		}
	};

	Cashflow.classes.app.User = function () {
		Cashflow.classes.db.TableClass.call(this, 'user');

		this.getActiveUser = function () {
			var active_user = this.db.find( {active:true} );

			if ( active_user.length != 1 ) {
				throw "Active user query should return exactly 1 result";
			};

			return active_user[0];
		};

		this.getUserSettings = function ( user, name ) {
			if ( name ) {
				return user.settings[ name ];
			}
			return user.settings;
		};

		this.getActiveUserSettings = function ( name ) {
			return this.getUserSettings( this.getActiveUser(), name );
		}
	};

})();
