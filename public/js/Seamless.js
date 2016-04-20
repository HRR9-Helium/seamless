// energy of a single pixel
// del_x^2 + del_y^2 = energy(x,y)
// del_x^2 = R_x(x,y)^2 + G_x(x,y)^2 + B_x(x,y)^2
// del_y^2 = R_y(x,y)^2 + G_y(x,y)^2 + B_y(x,y)^2

// Calculate R,G, and B values for X
var colorDiffX = function(i,j, rgb, array) {
  var left;
  var right;
  var length = array[0].length
  if ( j - 1 < 0 ) {
    left = Math.abs(array[i][length-1][rgb]);
  } else {
    left = Math.abs(array[i][j-1][rgb]);
  }
  if ( j + 1 > length - 1 ) {
    right = Math.abs(array[i][0][rgb])
  } else {
    right = Math.abs(array[i][j+1][rgb])
  }

  return  left - right
}

// Calculate del_x^2 value
var calcDelX = function(i, j, array) {
  var R = colorDiffX(i,j,'r', array);
  var G = colorDiffX(i,j,'g', array);
  var B = colorDiffX(i,j,'b', array);

  var energyValue = Math.pow(R, 2) + Math.pow(G, 2) + Math.pow(B, 2);
  return energyValue
}

// Calculate RGB values for Y
var colorDiffY = function(i,j, rgb, array) {
  var above;
  var below;
  var length = array.length
  if ( i - 1 < 0 ) {
    above = Math.abs(array[length-1][j][rgb]);
  } else {
    above = Math.abs(array[i-1][j][rgb]);
  }

  if ( i + 1 > length - 1 ) {
    below = Math.abs(array[0][j][rgb])
  } else {
    below = Math.abs(array[i+1][j][rgb])
  }

  return  above - below
}
// Calc del_y^2 value
var calcDelY = function(i, j, array) {
  var R = colorDiffY(i,j,'r', array);
  var G = colorDiffY(i,j,'g', array);
  var B = colorDiffY(i,j,'b', array);

  var energyValue = Math.pow(R, 2) + Math.pow(G, 2) + Math.pow(B, 2);
  // testArray[i][j].energy = energyValue; // I think take this out

  return energyValue
}

// This function will give the value of a single pixel
var pixelEnergy = function(i, j, array) {
  var energy = calcDelX(i, j, array) + calcDelY(i, j, array);
  return energy
}
// This function will give create a new matrix with the energy values
var energyMap = function(array) {
  var n = array.length;
  var m = array[0].length;
  var energyMatrix = new Array(n);
  for (var i = 0; i < n; i++) {
    energyMatrix[i] = new Array(m);
  }
  for ( var i = 0; i < array.length; i++ ) {
    for ( var j = 0; j < array[0].length; j++ ) {
      array[i][j].energy = pixelEnergy(i,j, array);
      energyMatrix[i][j] = pixelEnergy(i,j, array);
    }
  }
  return array;
}
// This function will update the energy values on either side of the seam
var energyZipper = function(matrix, pathArray) {
  var length = pathArray.length
  for ( x = 0; x < length; x++ ) {
    var rowVal = pathArray[x].row;
    var colVal = pathArray[x].col;
    matrix[rowVal][colVal].energy = pixelEnergy(rowVal, colVal, matrix)
  }
  return matrix
}
;function deleteBtn(e) {
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
      var imageSource = '<div class="card hoverable">' +
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
})();;var saveToFirebase = function(){
  var pic = ref.child('pics');

  ref.onAuth(function(authData){
    var newPicRef = pic.push({
                        name: getName(authData),
                        pic: 'auth pic'
    });
  });

  console.log(authData)
};

var refPics = new Firebase('https://dazzling-fire-2339.firebaseio.com/pics');
// Attach an asynchronous callback to read the data at our posts reference
var retFromFirebase = function(){
  refPics.on("value", function(snapshot) {
    console.log(snapshot.val());
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

};;var findVerticalSeam = function(energy) {
  var len = energy[0].length;
  var parent = energy[0].map(function(value) { return value.energy; });
  var current = new Array(len);
  var parentPaths = parent.map(function() { return ''; });
  var paths = new Array(len);
  var minParent;

  for (var i = 1; i < energy.length; i++) {
    for (var j = 0; j < energy[0].length; j++) {
      minParent = findMinimumParent(parent, j);
      current[j] = minParent.cost + energy[i][j].energy;

      paths[j] = parentPaths[minParent.index] + minParent.index + ',';
    }

    parent = current;
    current = [];

    parentPaths = paths;
    paths = [];
  }

  var minPathEnd = parent.indexOf(Math.min.apply(null, parent));

  return (parentPaths[minPathEnd] + minPathEnd).split(',');
};

var findHorizontalSeam = function(energy) {
  var len = energy.length;
  var parent = new Array(len);
  var parentPaths = new Array(len);
  var current = new Array(len);
  var paths = new Array(len);
  var minParent;

  for (var i = 0; i < energy.length; i++) {
    parent[i] = energy[i][0].energy;
    parentPaths[i] = '';
  }

  for (var j = 1; j < energy[0].length; j++) {
    for (var i = 0; i < energy.length; i++) {
      minParent = findMinimumParent(parent, i);
      current[i] = minParent.cost + energy[i][j].energy;

      paths[i] = parentPaths[minParent.index] + minParent.index + ',';
    }
    parent = current;
    current = [];

    parentPaths = paths;
    paths = [];
  }

  var minPathEnd = parent.indexOf(Math.min.apply(null, parent));

  return (parentPaths[minPathEnd] + minPathEnd).split(',');
};

var findMinimumParent = function(parents, index) {
  var left  = parents[index - 1] === undefined ? Infinity : parents[index - 1];
  var right = parents[index + 1] === undefined ? Infinity : parents[index + 1];
  var mid   = parents[index];

  var minParentCost = Math.min(left, mid, right);

  var minParentIndex;

  if (left === minParentCost)
    minParentIndex = index - 1;
  else if (mid === minParentCost)
    minParentIndex = index;
  else
    minParentIndex = index + 1;

  return { cost: minParentCost, index: minParentIndex };
};

var randomEnergy = function(width, height) {
  var energy = new Array(height);
  for (var i = 0; i < height; i++) {
    energy[i] = [];
    for (var j = 0; j < width; j++) {
      energy[i][j] = { energy: ~~(Math.random() * 10000) };
    }
  }
  return energy;
};
;var removeVerticalSeam = function(matrix, seam) {
  var adjPixels = [];

  for (var i = 0; i < matrix.length; i++) {
    var seamIndex = +seam[i];
    matrix[i].splice(seamIndex, 1);
    if (seamIndex + 1 < matrix[i].length - 1)
      adjPixels.push({ row: i, col: seamIndex });
    if (seamIndex - 1 > -1)
      adjPixels.push({ row: i, col: seamIndex - 1 });
  }

  return adjPixels;
};

var removeHorizontalSeam = function(matrix, seam) {
  var adjPixels = [];

  for (var i = 0; i < matrix[0].length; i++) {
    var seamIndex = +seam[i];
    for (var j = seamIndex; j < matrix.length - 1; j++) {
      matrix[j][i] = matrix[j+1][i];
    }
    if (seamIndex + 1 < matrix.length - 1)
      adjPixels.push({ row: seamIndex, col: i });
    if (seamIndex - 1 > -1)
      adjPixels.push({ row: seamIndex - 1, col: i });
  }

  matrix.splice(matrix.length - 1, 1);

  return adjPixels;
};
;(function($){
    $('.modal-trigger').leanModal({
      dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
      ready: function() { alert('Ready'); }, // Callback for Modal open
      complete: function() { alert('Closed'); } // Callback for Modal close
    }
  );
})