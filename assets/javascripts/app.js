localStorage.notedown = localStorage.notedown || JSON.stringify({
  id: 0,
  order: ["0"],
  current: "0",
  states: {
    "0": {
      title: "untitled notes",
      contents: '<div>FAST LINE FORMATTING</div><div><br></div><div><u>At beginning of a line:</u></div><div><u><br></u></div><div>type "b " to start typing in&nbsp;<b>bold</b></div><div>type "i&nbsp;"&nbsp;to start typing in&nbsp;<i>italic</i><br></div><div>type "u&nbsp;"&nbsp;to start typing in&nbsp;<u>underline</u><br></div><div><u><br></u></div><div><ul><li>type "* " for bulleted list</li></ul><div><ol><li>type "+ " for numbered list</li></ol><div><br></div></div></div>',
      pastEnter: 0,
      lastKey: ''
    }
  }
});

var notedown = JSON.parse(localStorage.notedown);

$(document).ready(function(){
  // console.log(localStorage.notedown);
  $('#container, #sidebar').css('min-height', $(window).height() - 50);
  $('#canvas').css('min-height', $(window).height() - 50).focus();
  placeCaretAtEnd('canvas');
  for(var i in notedown.order){
    renderContent(renderNote(notedown.order[i], $('#new-note')));
  }
});

$(document).on('click', 'a.trigger', function(){
  if($(this).data('show')){
    $($(this).data('show')).removeClass("hidden");
  }
  if($(this).data('hide')){
    $($(this).data('hide')).addClass("hidden");
  }
  $('#canvas').focus();
  return false;
});

$(document).on('click', '.note-cancel', function(){
  var id = $(this).parent().data('id').toString();
  renderContent(renderNote(id, $(this).parent().next()));
  $(this).parent().remove();
  $('#canvas').focus();
  return false;
});

$(document).on('click', '.note-remove', function(){
  if($(this).parent().hasClass('list-group-item-danger')){
    var id = $(this).parent().data('id').toString();
    var order = notedown.order.indexOf(id);
    renderContent($(this).parent().prev())
    delete notedown.states[id];
    delete notedown.order.splice(order, 1);
    $(this).parent().remove();
  }
  else {
    $(this).parent().addClass('list-group-item-danger');
  }
  return false;
});

$(document).on('click', '.note-edit', function(){
  if($(this).parent().hasClass('list-group-item-info')){
    var id = $(this).parent().data('id').toString();
    var title = $(this).parent().children('.note-title').text();
    if(!title) return;

    notedown.states[id].title = title;
    renderContent(renderNote(id, $(this).parent().next()));
    $(this).parent().remove();
  }
  else {
    $(this).parent().addClass('list-group-item-info');
    $(this).parent().children('.note-title').attr("contenteditable", true).selectText();
  }
  return false;
});

$(document).on('keydown', 'span.note-title', function(e){
  if(e.which == 13){
    $(this).parent().children('.note-edit').click();
    return false;
  }
});

function process(command, args){
  document.execCommand('delete', false, null);
  document.execCommand(command, false, args || null);
  return false;
}

function markDirty(){
  $('#save-status').removeClass('glyphicon-ok green').addClass('glyphicon-flash red');
}

$(document).on('keydown', 'div#canvas', function(e){
  // console.log("lastKey=" + notedown.currentState.lastKey + ' e.which=' + e.which + e.metaKey + ' pastEnter=' + notedown.currentState.pastEnter);
  markDirty();
  if(e.which == 8) notedown.currentState.pastEnter = 0;
  if(e.which == 83 && e.metaKey){
    saveStorage();
    return false;
  }
});

$(document).on('keypress', 'div#canvas', function(e){
  if(notedown.currentState.pastEnter == 0) reformat('canvas');
  if(e.which == 32 && notedown.currentState.pastEnter == 1){
    switch(notedown.currentState.lastKey){
      case 98: // b
        return process('bold');

      case 105: // i
        return process('italic');

      case 117: // u
        return process('underline');

      case 43: // +
        return process('insertOrderedList');

      case 42: // *
        return process('insertUnorderedList');

      default:
        break;
    }
  }

  if(e.which == 13){
    notedown.currentState.pastEnter = 0;
  } else {
    notedown.currentState.pastEnter++;
  }

  notedown.currentState.lastKey = e.which;
});

jQuery.fn.selectText = function(){
  var doc = document;
  var element = this[0];
  console.log(this, element);
  if (doc.body.createTextRange) {
    var range = document.body.createTextRange();
    range.moveToElementText(element);
    range.select();
  } else if (window.getSelection) {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

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

function reformat(id){
  document.execCommand('insertText', false, 'h');
  var s = window.getSelection();
  var range = s.getRangeAt(0);

  var clone = range.cloneRange();
  clone.setStart(range.startContainer, range.startOffset - 1);
  clone.setEnd(range.startContainer, range.startOffset);
  s.removeAllRanges();
  s.addRange(clone);
  document.execCommand('removeFormat', false, null);

  range.collapse(false);
  s.removeAllRanges();
  s.addRange(range);
  document.execCommand('delete', false, null);
}

function renderNote(id, newNode){
  return $('<button type="button" class="list-group-item notes hover" data-id="'+id+'"><span class="note-title">'+notedown.states[id].title+'</span>'+ (id != "0" ? '<input class="note-remove pull-right confirm-target btn btn-default" type="button" value="DELETE" /></span><span class="note-remove pull-right hover-target glyphicon glyphicon-remove danger"></span>' : '') + '<input class="note-edit pull-right confirm-target btn btn-default" type="button" value="SAVE" /><span class="note-edit pull-right hover-target glyphicon glyphicon-pencil"></span><input class="note-cancel pull-right confirm-target btn btn-default" type="button" value="CANCEL" /></button>').insertBefore(newNode);
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
  // console.log('saving ...');
  saveCurrent();
  localStorage.notedown = JSON.stringify(notedown);
  // console.log('saved!');
  $('#save-status').removeClass('glyphicon-flash red').addClass('glyphicon-ok green');
}

$(document).on('click', '#new-note', function(){
  var d = new Date();
  var title = d.toString().substring(0, 21);
  if(!title) return;

  saveCurrent();
  notedown.id++;
  var current = notedown.id.toString()
  notedown.order.push(current);
  notedown.states[current] = notedown.states[current] || {
    title: title,
    contents: '',
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
  if(!$(this).hasClass('list-group-item-info'))
    renderContent(this);
  markDirty();
});

setInterval(saveStorage, 60000);

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