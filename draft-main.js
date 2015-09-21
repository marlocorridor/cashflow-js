// Main
(function () {
	initializeApp();

	Cashflow.showAll = function () {
		return {
			users: Cashflow.Users.db.findAll(),
			budgets: Cashflow.Budgets.db.findAll(),
			entries: Cashflow.Entries.db.findAll(),
			accounts: Cashflow.Accounts.db.findAll(),
		};
	}
})();

// Event Handlers
(function () {
	$('.account-list')
		.on('click', '.account-row .account-summary', function (e) {
			var account_row    = getAccountSummaryParentRow( $(this) ),
				account_detail = getAccountRowDetail( account_row );

			// render detail
			Cashflow.Accounts.showAccountEntryList(
				account_row.data('account-id'),
				account_detail.find('table')
			);

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
})();


function toggleAccountDetail ( $account_detail ) {
	return $account_detail.fadeToggle();
}

function getAccountSummaryParentRow ( $account_summary ) {
	return $account_summary.parent();
}

function getAccountRowDetail ( $account_row ) {
	return $account_row.find( '.account-detail' );
}

function getDetailRowEntryId ( $detail_row ) {
	return $detail_row.data('entry-id');
}

function getDetailViewEntry () {
	return $('.detail-view-entry');
}

function getDetailView () {
	return $('.detail-view');
}

function clearDetailViews () {
	return getDetailView().children('div').slideUp();
}

/**
 * Show the details of the Entry to front-end
 * @param  {obj} entry_data
 * @return {bool}          true for success
 */
function showEntryDetail ( entry_data ) {
	console.log( entry_data );
}

function initializeApp () {
	Cashflow.Users    = new Cashflow.classes.app.User();
	Cashflow.Budgets  = new Cashflow.classes.app.Budget();
	Cashflow.Entries  = new Cashflow.classes.app.Entry();
	Cashflow.Accounts = new Cashflow.classes.app.Account( Cashflow.Budgets, Cashflow.Users, Cashflow.Entries );
}
