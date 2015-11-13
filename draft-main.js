// Main
(function () {
	initializeApp();
	initializePlugin();

	Cashflow.showAll = function () {
		return {
			users: Cashflow.Users.db.findAll(),
			budgets: Cashflow.Budgets.db.findAll(),
			allocations: Cashflow.Budgets.allocations.findAll(),
			entries: Cashflow.Entries.db.findAll(),
			accounts: Cashflow.Accounts.db.findAll(),
		};
	};

	clearDetailViews();
})();

// Event Handlers
(function () {
	$('.menu-bar')
		.on('click', '.budget-setting', function (e) {
			// show view
			showDetailView('budget-setting');
		})
		.on('click', '.account-setting', function (e) {
			// show view
			showDetailView('account-setting');
		})
		.on('click', '.help-page', function (e) {
			// show view
			showDetailView('help-page');
		});

	$('.account-list')
		.on('click', '.account-row .account-summary', function (e) {
			var account_row    = getAccountSummaryParentRow( $(this) ),
				account_detail = getAccountRowDetail( account_row ),
				account        = Cashflow.Accounts.getAccount( account_row.data('account-id') );

			// set detail values
			var detail_view = getDetailView('account');
			detail_view.data('account-id', account._id.toString());
			getDetailField( detail_view, 'description' ).html( account.description );
			getDetailField( detail_view, 'total-expense' ).html(
				numeral(account.total_expense).format( Cashflow.global.constants.numberFormat )
			);
			showDetailView( detail_view );

			// check if already rendered
			if ( !account_detail.data('rendered') ) {
				// set rendered flag
				account_detail.data('rendered', true);
				// render detail
				Cashflow.Accounts.renderAccountEntriesList(
					account_row.data('account-id'),
					account_detail.find('table')
				);
			};

			// show detail
			toggleAccountDetail( account_detail );
		})
		.on('click', '.account-row .account-detail-table tr', function (e) {
			var detail_row = $( this ),
				entry_id   = getDetailRowEntryId( detail_row );

			if ( entry_id ) {
				var entry_data = Cashflow.Entries.getEntry( entry_id );
				showEntryDetail(entry_data);
			}else{
				console.warn( 'Data id not defined', detail_row );
			}
		});

	$('.detail-view')
		.on('click','.clear-detail-view', function (e) {
			clearDetailViews();
		})
		.on('click','.toggle-entries', function (e) {
			var account_row    = $('.account-row[data-account-id=' + getDetailView('account').data('account-id') + ']'),
				account_detail = getAccountRowDetail( account_row ),
				account        = Cashflow.Accounts.getAccount( account_row.data('account-id') );

			// render detail
			Cashflow.Accounts.renderAccountEntriesList(
				account_row.data('account-id'),
				account_detail.find('table')
			);

			// show detail
			toggleAccountDetail( account_detail );
		})
		.on('click','.add-entry', function (e) {
			// set detail values
			var detail_view = getDetailView('entry-form');
			clearDetailViewInputFields( detail_view );
			getDetailField( detail_view, 'action' ).html( 'Create' );
			showDetailView( detail_view );
		})
		.on('click','.update-entry', function (e) {
			// set detail values
			var detail_view = getDetailView('entry-form');
			var entry       = Cashflow.Entries.getEntry(
				getDetailView('entry').data('entry-id')
			);

			detail_view.data(
				'entry-id',
				entry._id
			);

			getDetailInputField( detail_view, 'description' ).val( entry.description );
			getDetailInputField( detail_view, 'amount' ).val( entry.amount );
			getDetailInputField( detail_view, 'date' ).val( entry.date.used );
			getDetailInputField( detail_view, 'remarks' ).val( entry.remarks );
			getDetailField( detail_view, 'action' ).html( 'Update' );
			showDetailView( detail_view );
		})
		.on('submit','form.save-entry', function (e) {
			// prevent default submit behavior
			e.preventDefault();

			var detail_view = getDetailView('entry-form');
			// get detail values
			var entry    = generateFormEntryData( this );
			var entry_id = getDetailViewFormDataId( detail_view, 'entry' );
			// detemine action
			var result = ( isDetailViewFormUpdateAction( detail_view ) ) ? 
				Cashflow.Accounts.entries.update( entry, entry_id ) :
				Cashflow.Accounts.entries.create( entry );

			// Cashflow
			if ( result ) {
				var account_id, account_row, account_detail, target_elem;

				account_id     = getDetailViewAccountId();
				account_row    = getAccountRowByDataId( account_id );
				account_detail = getAccountRowDetail( account_row );
				target_elem    = getAccountRowSummary( account_row );

				// update summary info
				Cashflow.Accounts.renderAccountSummary( account_id, target_elem );

				// render detail
				Cashflow.Accounts.renderAccountEntriesList(
					account_id,
					account_detail.find('table')
				);

				// show detail Account if hidden
				if ( !account_detail.is(':visible') ) {
					toggleAccountDetail( account_detail );
				}

			}else{
				throw "Invalid user data, please check input";
			}

		})
		.on('click','.add-account', function (e) {
			var detail_view = getDetailView('account-form');

			clearDetailViewInputFields( detail_view );
			getDetailField( detail_view, 'action' ).html( 'Save' );

			showDetailView( detail_view );
		})
		.on('click','.update-account', function (e) {
			var detail_view = getDetailView('account-form');
			var account     = Cashflow.Accounts.getAccount( getDetailViewAccountId() );

			detail_view.data(
				'account-id',
				account._id
			);

			// set detail values
			getDetailInputField( detail_view, 'name' ).val( account.name );
			getDetailInputField( detail_view, 'description' ).val( account.description );
			getDetailField( detail_view, 'action' ).html( 'Update' );
			showDetailView( detail_view );
		})
		.on('click','.update-account-allocation', function (e) {
			var detail_view = getDetailView('account-allocation-form');
			var account     = Cashflow.Accounts.getAccount( getDetailViewAccountId() );
			var budget      = Cashflow.Accounts.getBudget();

			detail_view.data(
				'account-id',
				account._id.toString()
			);

			var account_allocation = Cashflow.Accounts.getBudgetAllocation( 
				budget._id.toString(), account._id.toString()
			);


			// set detail values
			getDetailField( detail_view, 'account-description' ).html( account.description );
			getDetailInputField( detail_view, 'account-allocation' ).val( account_allocation );
			getDetailField( detail_view, 'action' ).html( 'Update' );
			showDetailView( detail_view );
		})
		.on('submit','form.save-account-allocation', function (e) {
			// prevent default submit behavior
			e.preventDefault();

			var detail_view = getDetailView('account-allocation-form');
			// get detail values
			var account_id = getDetailViewFormDataId( detail_view, 'account' );
			var budget_id  = Cashflow.Accounts.getBudget()._id.toString();
			var allocation = generateFormData( this ).allocation;
			// update always
			var result = Cashflow.Accounts.setBudgetAllocation( budget_id, account_id, allocation );

			// Cashflow
			if ( result ) {
				var account_row, account_detail, target_elem;

				account_row = getAccountRowByDataId( account_id );
				target_elem = getAccountRowSummary( account_row );

				Cashflow.Accounts.renderAccountSummary( account_id, target_elem );
			}else{
				throw "Update unsuccessful";
			}
		})
		.on('submit','form.save-account', function (e) {
			// prevent default submit behavior
			e.preventDefault();

			var detail_view = getDetailView('account-form');
			// get detail values
			var account = generateFormData( this );
			var account_id = getDetailViewFormDataId( detail_view, 'account' );
			// detemine action
			var is_update = isDetailViewFormUpdateAction( detail_view );
			var result    = ( is_update ) ? 
				Cashflow.Accounts.update( account, account_id ) :
				Cashflow.Accounts.create( account );

			// Cashflow
			if ( result ) {
				if ( is_update ) {
					var account_row, account_detail, target_elem;

					account_row = getAccountRowByDataId( account_id );
					target_elem = getAccountRowSummary( account_row );

					Cashflow.Accounts.renderAccountSummary( account_id, target_elem );
				} else{
					Cashflow.Accounts.renderNewAccount(
						account._id,
						$( Cashflow.Accounts.template.container.target )
					);
				}
			}else{
				throw "Invalid user data, please check input";
			}
		})
		.on('click','.update-budget', function (e) {
			var detail_view = getDetailView( 'budget-form' );
			var budget      = Cashflow.Accounts.getBudget();

			detail_view.data(
				'budget-id',
				budget._id
			);

			getDetailInputField( detail_view, 'name' ).val( budget.name );
			getDetailInputField( detail_view, 'date-start' ).val( budget.date.start );
			getDetailInputField( detail_view, 'date-end' ).val( budget.date.end );
			getDetailField( detail_view, 'action' ).html( 'Update' );

			showDetailView( detail_view );
		})
		.on('submit','form.save-budget', function (e) {
			// prevent default submit behavior
			e.preventDefault();

			var detail_view = getDetailView('budget-form');
			// get detail values
			var budget      = generateFormData( this );

			var budget_id = getDetailViewFormDataId( detail_view, 'budget' );
			// detemine action update or create
			var result = Cashflow.Budgets.update( budget, budget_id );
			Cashflow.Budgets.db.commit();

			// update displays
			// hide details
			hideAccountDetails();
			// remove elements
			$(Cashflow.Accounts.template.container.target).html('');
			// render again
			Cashflow.Accounts.setup();
		});
})();

function getDetailViewFormDataId ( detail_view, field ) {
	return detail_view.data( field + '-id' );
}

function getDetailViewFormAction ( detail_view ) {
	return getDetailField( 
		detail_view,
		'action'
	).html();
}

function isDetailViewFormUpdateAction ( detail_view ) {
	var form_action = getDetailViewFormAction( detail_view ).toLowerCase();
	var is_update   = form_action == 'update';
	return is_update;
}

function isArrayInputName ( input_name ) {
	return _.include(input_name,"[]");
}

function getInputArrayName ( input_name ) {
	return input_name.replace("[]","");
}

function generateFormData ( form ) {
	var form_data = $( form ).serializeArray();
	var data      = {};

	// extract form data
	form_data.forEach(function ( input ) {
		var split_name, first_key, parsed_input;

		// get the objectified input name with value
		split_name   = input.name.split('.');
		parsed_input = generateInputDataObject( 
			split_name, 
			input.value
		);

		// merge parsed input value to current data collection
		_.merge( data, parsed_input, function ( a, b ) {
			return _.isArray(a) ? a.concat(b) : undefined;
		});
	});

	return data;
}

function generateInputDataObject ( name_array, value ) {
	if ( !name_array.length ) {
		return value;
	} else {
		var obj, obj_key;

		obj     = {};
		obj_key = name_array[0];

		if ( isArrayInputName( obj_key ) ) {
			obj_key = getInputArrayName( obj_key );
			// assign as array
			obj[ obj_key ] = [ generateInputDataObject( name_array.slice(1), value ) ];
		} else{
			// assign as object-key pair
			obj[ obj_key ] = generateInputDataObject( name_array.slice(1), value );
		}

		return obj;
	}

}

function generateFormEntryData ( form ) {
	var entry = generateFormData( form );

	// set auto data
	entry.date = {
		used: entry.date,
		created: getCurrentDateString()
	};

	entry.account = {
		id: getDetailViewAccountId()
	};

	entry.user = {
		id: Cashflow.Accounts.users.getActiveUserId()
	};

	return entry;
}

function getAccountRowByDataId ( account_id ) {
	return $(".account-row[data-account-id='" + account_id + "']");
}

function getDetailViewAccountId () {
	// return data set from clicking the account-summary element
	return getDetailView('account').data('account-id');
}

function getCurrentDateString () {
	var today = new Date();
	return today.getFullYear() + '/' + 
		lead( today.getMonth() + 1 ) + '/' + 
		today.getDate(); 
}

function lead ( number ) {
    return ( number < 10 ? '0': '' ) + number;
}

function hideAccountDetails () {
	return toggleAccountDetail( $('.account-list .account-detail') );
}

function toggleAccountDetail ( $account_detail ) {
	return $account_detail.slideToggle();
}

function getAccountSummaryParentRow ( $account_summary ) {
	return $account_summary.parent();
}

function getAccountRowSummary ( $account_row ) {
	return $account_row.children( '.account-summary' );
}

function getAccountRowDetail ( $account_row ) {
	return $account_row.find( '.account-detail' );
}

function getDetailRowEntryId ( $detail_row ) {
	return $detail_row.data('entry-id');
}

function getDetailInputField ( detail_view, field ) {
	return getDetailField( detail_view, 'input-' + field );
}

function getDetailField ( detail_view, field ) {
	return detail_view.find( '.detail-view-' + field );
}

function getDetailView ( section ) {
	if ( section ) {
		return $('.detail-view .detail-view-' + section);
	} else{
		return $('div.detail-view');
	}
}

function getDetailViewSectionName ( detail_view ) {
	var detail_view_class_prefix, section_name;

	detail_view_class_prefix = "detail-view-";
	section_name = detail_view.attr('class').match( 
			RegExp( detail_view_class_prefix + "([a-zA-Z\-]+)" )
	);

	// since the `match` method returns an array, 
	// 	what we want is on the last item
	return _.last( section_name );
}

function showDetailViewBySectionName ( section_name ) {
	return getDetailView( section_name ).slideDown();
}

function showDetailViewByDetailViewObject ( detail_view ) {
	return detail_view.slideDown();
}

/**
 * Shows the detail view element
 * @param  {string || object} section 
 *                    detail-view name or the detail-view element
 * @return {object}         detail-view element for chaining
 */
function showDetailView ( section ) {
	var section_name, isDetailViewObject;

	if ( _.isString( section ) ) {
		section_name = section;
	} else{
		// determine section name
		section_name       = getDetailViewSectionName( section );
		isDetailViewObject = true;
	};

	if ( Cashflow.activeDetailSection !== section_name ) {
		clearDetailViews();
		Cashflow.activeDetailSection = section_name;

		return isDetailViewObject ? 
			showDetailViewByDetailViewObject( section ):
			showDetailViewBySectionName( section_name );
	}
}

function clearDetailViewInputFields ( detail_view ) {
	return detail_view.find( "input[class*='detail-view-input-']" ).val('');
}

function clearDetailViews () {
	Cashflow.activeDetailSection = null;
	return getDetailView().children('div').slideUp();
}

/**
 * Show the details of the Entry to front-end
 * @param  {obj} entry
 * @return {bool}          true for success
 */
function showEntryDetail ( entry ) {
	// set detail values
	var detail_view = getDetailView('entry'),
		account     = Cashflow.Accounts.getAccount( entry.account.id );
	// set data
	detail_view.data('entry-id', entry._id);
	// set contents
	getDetailField( detail_view, 'account' ).html( account.name );
	getDetailField( detail_view, 'remarks' ).html( entry.remarks || '' );
	getDetailField( detail_view, 'date-used' ).html(
		moment( new Date( entry.date.used ) ).format( Cashflow.global.constants.dateMomentFormat )
	);
	// show
	showDetailView( detail_view );
}

function initializeApp () {
	Cashflow.Users    = new Cashflow.classes.app.User();
	Cashflow.Budgets  = new Cashflow.classes.app.Budget();
	Cashflow.Entries  = new Cashflow.classes.app.Entry();
	Cashflow.Accounts = new Cashflow.classes.app.Account( Cashflow.Budgets, Cashflow.Users, Cashflow.Entries );

	Cashflow.activeDetailSection = null;
	Cashflow.previousDetailView = null;
}

function initializePlugin () {
	$('input[name*="date"]').pickadate({
		format: Cashflow.global.constants.dateFormat,
	});
}
