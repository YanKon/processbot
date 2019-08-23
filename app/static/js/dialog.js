// benötigt animate.css & jquery
function createDialogOverlay(title,html) {
    $('body').prepend(
      '<div class="io-dialog animated fadeInDown faster">' +
        '<div class="content">' +
            '<h1>' + title + '</h1>' +
            '<i class="fas fa-times"></i>' +
            '<div class="ownContent"></div>' +
        '</div>' +
      '</div>' 
    );
  
    $('.ownContent').append(html)
  
    $('.fa-times').click(function() {
        $('.io-dialog').removeClass("animated fadeInDown faster");
        $('.io-dialog').addClass("animated zoomOut faster");

        $('.io-dialog').bind('animationend', function() {
            $('.io-dialog').remove();
          }); 
    });

  }

function createHelpOverlay() {
  var html = 
    '<p style="text-align:left; border-bottom: 1px solid LightGrey; font-weight:bold;">Processbot</p>' +
    '<p>"what is the processbot?"</p>' +
    '<p>"help"</p>' +
    '</br>' +
    '<p style="text-align:left; border-bottom: 1px solid LightGrey; font-weight:bold;">Process</p>' +
    '<p>"what is the documentation of [process name]?"</p>'+
    '<p>"which processes are there?"</p>'+
    '<p>"execute process [process name]!"</p>'+
    '<p>"show the process model for [process name]!"</p>'+
    '<p>"display [process name]"</p>'+
    '<p>"what do I have to do in the step [process step] in [process name]?"</p>'+
    '<p>"step [process step][process name]"</p>'
  createDialogOverlay('For example, you could ask me the following:',html)
}