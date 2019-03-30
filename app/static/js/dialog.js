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