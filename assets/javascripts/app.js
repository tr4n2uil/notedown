localStorage.notedown = localStorage.notedown || JSON.stringify({
  id: 0,
  order: ["0"],
  current: "0",
  states: {
    "0": {
      title: "untitled notes",
      contents: '',
      commands: [],
      pastEnter: 0,
      lastKey: ''
    }
  }
});

var notedown = JSON.parse(localStorage.notedown);

$(document).ready(function(){
  console.log(localStorage.notedown);
  $('#container, #sidebar').css('min-height', $(window).height() - 50);
  $('#canvas').css('min-height', $(window).height() - 50).focus();
  placeCaretAtEnd('canvas');
  for(var i in notedown.order){
    renderContent(renderNote(notedown.order[i], $('#new-note')));
  }
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

function process(command, push, args){
  document.execCommand('delete', false, null);
  document.execCommand(command, false, args || null);
  if(push) notedown.currentState.commands.push(command);
  return false;
}

$(document).on('keypress', 'div#canvas', function(e){
  // console.log("lastKey=" + notedown.currentState.lastKey + ' e.which=' + e.which + ' pastEnter=' + notedown.currentState.pastEnter);
  if(e.which == 32 && notedown.currentState.pastEnter == 1){
    switch(notedown.currentState.lastKey){
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
    resetFormat();
  } else {
    notedown.currentState.pastEnter++;
  }

  notedown.currentState.lastKey = e.which;
});

function resetFormat(){
  // console.log("resetFormat", notedown.currentState.commands);
  for(var i in notedown.currentState.commands){
    document.execCommand(notedown.currentState.commands[i], false, null);
  }
  notedown.currentState.commands = [];
  notedown.currentState.pastEnter = 0;
}

function placeCaretAtEnd(id) {
  var el = document.getElementById(id)
  el.focus();
  if (typeof window.getSelection != "undefined"
          && typeof document.createRange != "undefined") {
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
}

function renderNote(id, newNode){
  return $('<button type="button" class="list-group-item notes" data-id="'+id+'">'+notedown.states[id].title+'</button>').insertBefore(newNode);
}

function saveCurrent(){
  notedown.currentState.contents = $('#canvas').html();
}

function renderContent(el){
  $(el).siblings().removeClass('current');
  $(el).addClass('current');
  notedown.current = $(el).data('id').toString();
  notedown.currentState = notedown.states[notedown.current]
  // console.log("rendering.." + notedown.currentState.contents);
  $('#canvas').html(notedown.currentState.contents).focus();
  placeCaretAtEnd('canvas');
}

$(document).on('click', '#new-note', function(){
  saveCurrent();
  notedown.id++;
  notedown.current = notedown.id.toString()
  notedown.order.push(notedown.current);
  notedown.currentState = notedown.states[notedown.current] = notedown.states[notedown.current] || {
    title: 'untitled notes ' + notedown.current,
    contents: '',
    commands: [],
    pastEnter: 0,
    lastKey: ''
  };
  renderNote(notedown.current, $(this)).click();
});

$(document).on('click', 'button.list-group-item.notes', function(){
  renderContent(this);
});

setInterval(function(){
  console.log('saving ...');
  saveCurrent();
  localStorage.notedown = JSON.stringify(notedown);
  console.log('saved!');
}, 10000);

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
