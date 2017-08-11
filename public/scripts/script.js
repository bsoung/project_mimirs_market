$(function() {
	// Init tooltips
	$('[data-toggle="tooltip"]').tooltip();
	$(".search-form").on("click", ".advanced-btn", e => {
		$(".advanced-bar").slideToggle(300);
		e.preventDefault();
	});
});
