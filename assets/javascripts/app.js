$(document).ready(function(){
  $('#container').css('min-height', $(window).height() - 50);
  $('#canvas').css('min-height', $(window).height() - 50).focus();
});

$(document).on('click', 'a.trigger', function(){
  if($(this).data('show')){
    $('#' + $(this).data('show')).removeClass("hidden");
  }
  if($(this).data('hide')){
    $('#' + $(this).data('hide')).addClass("hidden");
  }
  $('#canvas').focus();
  return false;
});

var lastKey = '', commands = [], pastEnter = 0;

function process(command, push, args){
  document.execCommand('delete', false, null);
  document.execCommand(command, false, args || null);
  if(push) commands.push(command);
  return false;
}

$(document).on('keypress', 'div#canvas', function(e){
  // console.log("lastKey=" + lastKey + ' e.which=' + e.which + ' pastEnter=' + pastEnter);
  if(e.which == 32 && pastEnter == 1){
    switch(lastKey){
      case 98: // b
        return process('bold', true);

      case 105: // i
        return process('italic', true);

      case 117: // u
        return process('underline', true);

      case 43: // +
        return process('insertOrderedList');

      case 42: // *
        return process('insertUnorderedList');

      default:
        break;
    }
  }

  if(e.which == 13){
    for(var i in commands){
      document.execCommand(commands[i], false, null);
    }
    commands = [];
    pastEnter = 0;
  } else {
    pastEnter++;
  }

  lastKey = e.which;
});

// GA Tracking
$(document).ready( function(){
  // google analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-47160625-1', 'vibhaj.com');
  ga('send', 'pageview');
});
