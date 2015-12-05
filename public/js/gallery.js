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
      var imageSource = '<div class="card">' +
        '<div class="card-image firebaseImage">' +
          '<img src= '+ imageData.src +' />' +
        '</div>' + '<p class="btn" id="' + key + '"onClick="deleteBtn(this.id)">Delete</p>' +
      '</div>'

      var imageTemplate = Handlebars.compile(imageSource);
      var imageResult = "";
      imageResult = imageTemplate(imageData)

      $('#gallery').append(imageResult);
    }
  });
})();