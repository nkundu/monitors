var showBusyModal = function () {
    $.blockUI({ 
    	message: '<div class="spinner"></div><br />Please wait...',
    	css: { 
        border: 'none', 
        padding: '15px', 
        backgroundColor: '#000', 
        '-webkit-border-radius': '10px', 
        '-moz-border-radius': '10px', 
        opacity: .5, 
        color: '#fff' 
      }
    }); 
}

$(document).ready(function(){
    $('a').click( function() {
        showBusyModal();
    });
});