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

$(document).on('click', 'span.note-remove', function(){
  if(confirm('Are you sure you want to delete this note?')){
    var id = $(this).parent().data('id').toString();
    var order = notedown.order.indexOf(id);
    renderContent($(this).parent().prev())
    delete notedown.states[id];
    delete notedown.order.splice(order, 1);
    $(this).parent().remove();
  }
  return false;
});

$(document).on('click', 'span.note-edit', function(){
  var id = $(this).parent().data('id').toString();
  var title = prompt('Enter New Title', notedown.states[id].title);
  if(!title) return;

  notedown.states[id].title = title;
  renderContent(renderNote(id, $(this).parent().next()));
  $(this).parent().remove();
  return false;
});

function process(command, push, args){
  document.execCommand('delete', false, null);
  document.execCommand(command, false, args || null);
  if(push) notedown.currentState.commands.push(command);
  return false;
}

function markDirty(){
  $('#save-status').removeClass('glyphicon-ok green').addClass('glyphicon-flash red');
}

$(document).on('keydown', 'div#canvas', function(e){
  markDirty();
  if(e.which == 8) notedown.currentState.pastEnter = 0;
});

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
  return $('<button type="button" class="list-group-item notes hover" data-id="'+id+'">'+notedown.states[id].title+ (id != "0" ? '<span class="note-remove pull-right hover-target glyphicon glyphicon-remove danger"></span>' : '') + '<span class="note-edit pull-right hover-target glyphicon glyphicon-pencil"></span></button>').insertBefore(newNode);
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

function saveStorage(){
  console.log('saving ...');
  saveCurrent();
  localStorage.notedown = JSON.stringify(notedown);
  console.log('saved!');
  $('#save-status').removeClass('glyphicon-flash red').addClass('glyphicon-ok green');
}

$(document).on('click', '#new-note', function(){
  var d = new Date();
  var title = prompt("Enter Title", d.toString().substring(0, 21));
  if(!title) return;

  saveCurrent();
  notedown.id++;
  var current = notedown.id.toString()
  notedown.order.push(current);
  notedown.states[current] = notedown.states[current] || {
    title: title,
    contents: '',
    commands: [],
    pastEnter: 0,
    lastKey: ''
  };
  renderNote(current, $(this)).click();
  notedown.current = current;
  notedown.currentState = notedown.states[current]
  markDirty();
});

$(document).on('click', 'button.list-group-item.notes', function(){
  saveCurrent();
  renderContent(this);
});

setInterval(saveStorage, 10000);

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

window.onbeforeunload = function(e) {
  saveStorage();
};