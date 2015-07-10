/**
 *
 * Cryptographic Algorithms
 *
**/
// RC4
function RC4(){
  this.S = [];
}
RC4.prototype.Init = function (){
  // Get & Set values
  this.vectorLength = parseInt( $('#vectorLength').val());
  this.key = $('#key').val();
  this.firstBytesDrop = parseInt( $('#firstBytesDrop').val());
}
RC4.prototype.Crypt = function (plainText) {
  this.Init();
  // // Get & Set values
  // this.vectorLength = parseInt( $('#vectorLength').val());
  // this.key = $('#key').val();
  // this.firstBytesDrop = parseInt( $('#firstBytesDrop').val());

  //Create initialization vector
  var iv = GenerateKey(this.vectorLength);
  var ivKey = String(iv)+String(this.key);
  console.log('iv='+iv+' key='+this.key+' ivkey='+ivKey);
  // Init S
  for (var i=0; i<256; i++){
    this.S[i] = i;
  }
  // Hash S as init for 256 times.
  var j=0;
  for (var i=0; i<256; i++){
    j = (j + this.S[i] + ivKey[i % ivKey.length].charCodeAt(0) ) % 256;
    //swap values of S[i] and S[j]
    var temp= this.S[i];
    this.S[i] = this.S[j];
    this.S[j] = temp;
  }
  // Drop the first N bytes from what user has given
  for (var i=0,j=0; i<this.firstBytesDrop; i++){
    i = (i + 1) % 256;
    j = (j + this.S[i]) % 256;
    //swap values of S[i] and S[j]
    var temp= this.S[i];
    this.S[i] = this.S[j];
    this.S[j] = temp;
  }
  var i = 0;
  var j = 0;
  var K = '';
  for (var y=0; y<plainText.length; y++) {
    i = (i + 1) % 256;
    j = (j + this.S[i]) % 256;
    //swap values of S[i] and S[j]
    var temp= this.S[i];
    this.S[i] = this.S[j];
    this.S[j] = temp;

    K += String.fromCharCode(plainText.charCodeAt(y) ^ this.S[(this.S[i] + this.S[j]) % 256]);
  }
  //return K;
  console.log('end: iv='+iv+' K='+K);
  return String(iv)+String(K);
}
RC4.prototype.Decrypt = function (ivCipherText) {
  // Get & Set values
  this.vectorLength = parseInt( $('#vectorLength').val());
  this.key = $('#key').val();
  this.firstBytesDrop = parseInt( $('#firstBytesDrop').val());
  
  var iv = ivCipherText.substring(0, this.vectorLength);
  var cipherText = ivCipherText.substring(this.vectorLength);
  console.log('iv='+iv+' cipherText='+cipherText);
  console.log('key='+this.key);
  var ivKey = String(iv)+String(this.key);

  for (var i=0; i<256; i++){
    this.S[i] = i;
  }
  // Hash S as init for 256 times.
  var j=0;
  for (var i=0; i<256; i++){
    j = (j + this.S[i] + ivKey[i % ivKey.length].charCodeAt(0) ) % 256;
    //swap values of S[i] and S[j]
    var temp= this.S[i];
    this.S[i] = this.S[j];
    this.S[j] = temp;
  }
  // Drop the first N bytes from what user has given
  for (var i=0,j=0; i<this.firstBytesDrop; i++){
    i = (i + 1) % 256;
    j = (j + this.S[i]) % 256;
    //swap values of S[i] and S[j]
    var temp= this.S[i];
    this.S[i] = this.S[j];
    this.S[j] = temp;
  }

  var i = 0;
  var j = 0;
  var K = '';
  for (var y=0; y<cipherText.length; y++) {
    i = (i + 1) % 256;
    j = (j + this.S[i]) % 256;
    //swap values of S[i] and S[j]
    var temp= this.S[i];
    this.S[i] = this.S[j];
    this.S[j] = temp;

    K += String.fromCharCode(cipherText.charCodeAt(y) ^ this.S[(this.S[i] + this.S[j]) % 256]);
  }
  return String(K);
}

function GenerateKey(length) {
  for(var i=0, key = []; i < length; ++i)
      key[i] = 1 + ((Math.random() * 255) << 0);
  return String.fromCharCode.apply(String, key);
}