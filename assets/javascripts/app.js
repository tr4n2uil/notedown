$(document).ready(function(){
  $('#canvas').css('height', $(window).height() - 50).focus();
})

var lastKey = '', commands = [], pastEnter = 0;

function process(command, push){
  document.execCommand('delete', false, null);
  document.execCommand(command, false, null);
  if(push) commands.push(command);
  return false;
}

$(document).on('keypress', 'div#canvas', function(e){
  console.log("lastKey=" + lastKey + ' e.which=' + e.which + ' pastEnter=' + pastEnter);
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
