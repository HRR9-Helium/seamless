function deleteBtn(e) {
  var picData = new Firebase("https://dazzling-fire-2339.firebaseio.com/pics/" + e);
  $('.card').remove();
  picData.remove();
};

(function retFromFirebase(){
  var ref = new Firebase("https://dazzling-fire-2339.firebaseio.com/");

  var authData = ref.getAuth();

  var uid = getUid(authData);

  ref.child('pics').orderByChild('uid').equalTo(uid).on('value', function(snapshot){
    var snapObj = snapshot.val();
    for(key in snapObj){
      var imageData = new Image();

      imageData.src = snapObj[key]['pic'];
      var imageSource = '<div class="card-medium">' +
      '<div class="card-image firebaseImage center">' +
          '<img src= '+ imageData.src +' />' +
        '</div>' +
        '</div class="card-action">' +
          '<p class="waves-effect waves-light btn right" id="' + key + '"onClick="deleteBtn(this.id)">Delete</p>' +
        '</div>'
      '</div>'

      var imageTemplate = Handlebars.compile(imageSource);
      var imageResult = "";
      imageResult = imageTemplate(imageData)

      $('#gallery').append(imageResult);
    }
  });
})();