/**
 *
 * Cryptographic Algorithms
 *
**/
// 3DES
function DES3(){

}
DES3.prototype.Init = function (){
	// Get & Set values
	var key1 = fix64Length( $('#key1').val() );
	var key2 = fix64Length( $('#key2').val() );
	var key3 = fix64Length( $('#key3').val() );
	this.key = [key1, key2, key3];
	this.opMode = $('#opType').val();
}
DES3.prototype.Crypt = function (plainText) {
	// Input Test - 123456789
	// Get & Set all inputs
	this.Init();
	var des = new DES();
	switch (this.opMode){
		case 'CBC':
			var plaintextBitsText = BitsArrayFromString(plainText);
			var plaintextBitsAsMultiple64 = plaintextBitsAsMultiple_64(plaintextBitsText); //fix str to be as multiples of 64 bits
			//console.log(plaintextBitsAsMultiple64.length);
			var plain64chunks = chunkString(plaintextBitsAsMultiple64, 64);	//split str to chunks of 64bit

			// iv(64)
			var iv64 = GenerateBits(64);

			// Run on all plaintext chunks
			var ciphertextArr = [];
			for(var chunk in plain64chunks){

				// Run on all the chars 
				var plainChunkXorIV ='';
				for(var charIndex in plain64chunks[chunk]){
					if (chunk==0){
						// iv(64) XOR cipher64chunk
						plainChunkXorIV += String(parseInt(plain64chunks[chunk][charIndex]) ^ parseInt(iv64[charIndex]));
					}else{
						// cipher64Chunk-1 XOR cipher64chunk
						plainChunkXorIV += String(parseInt(plain64chunks[chunk][charIndex]) ^ parseInt(ciphertextArr[chunk-1][charIndex]));
					}
				}

				// crypt the xor result 3 times as 3DES
				var middleMix = des.Crypt(plainChunkXorIV, this.key[0]);
					middleMix = des.Crypt(middleMix, this.key[1]);
				var ciphertext = des.Crypt(middleMix, this.key[2]);

				// Save this cipher for after use
				ciphertextArr.push(ciphertext);
			}

			return iv64+ciphertextArr.join('');
			break;
		case 'OFB':
			var plaintextBitsText = BitsArrayFromString(plainText);
			var plaintextBitsAsMultiple64 = plaintextBitsAsMultiple_64(plaintextBitsText); //fix str to be as multiples of 64 bits
			//console.log(plaintextBitsAsMultiple64.length);
			var plain64chunks = chunkString(plaintextBitsAsMultiple64, 64);	//split str to chunks of 64bit

			// iv(64)
			var iv64 = GenerateBits(64);

			// Run on all plaintext chunks
			var ciphertextArr = [];
			for(var chunk in plain64chunks){
				if (chunk==0){
					var middleMix = des.Crypt(iv64, this.key[0]);
						middleMix = des.Crypt(middleMix, this.key[1]);
					var keyIVCipher = des.Crypt(middleMix, this.key[2]);
				}
				// Run on all the chars 
				var plainChunkXorIV ='';
				for(var charIndex in plain64chunks[chunk]){
					if (chunk==0){
						// iv(64) XOR cipher64chunk
						plainChunkXorIV += String(parseInt(plain64chunks[chunk][charIndex]) ^ parseInt(iv64[charIndex]));
					}else{
						// cipher64Chunk-1 XOR cipher64chunk
						plainChunkXorIV += String(parseInt(plain64chunks[chunk][charIndex]) ^ parseInt(ciphertextArr[chunk-1][charIndex]));
					}
				}

				// crypt the xor result 3 times as 3DES
				var middleMix = des.Crypt(plainChunkXorIV, this.key[0]);
					middleMix = des.Crypt(middleMix, this.key[1]);
				var ciphertext = des.Crypt(middleMix, this.key[2]);

				// Save this cipher for after use
				ciphertextArr.push(ciphertext);
			}
			break;
		case 'CTR':
			var plaintextBitsText = BitsArrayFromString(plainText);
			var plaintextBitsAsMultiple64 = plaintextBitsAsMultiple_64(plaintextBitsText); //fix str to be as multiples of 64 bits
			//console.log(plaintextBitsAsMultiple64.length);
			var plain64chunks = chunkString(plaintextBitsAsMultiple64, 64);	//split str to chunks of 64bit

			// rundom 64 bit number
			var num64bits = GenerateBits(64);
			var ctrDecNumber = parseInt(num64bits,2);
			var ctrBinNumber = (ctrDecNumber >>> 0).toString(2);
			var ctrBinNumberFixed64 = zeroPattern(ctrBinNumber, 64);

			// Run on all plaintext chunks
			var ciphertextArr = [];
			for(var chunk in plain64chunks){
				var ctrDecNumberCounterd = ctrDecNumber+chunk;
				var binNumberCounterd = (ctrDecNumberCounterd >>> 0).toString(2);
				var binNumberCounterdFixed64 = zeroPattern(binNumberCounterd, 64);

				// crypt the xor result 3 times as 3DES
				var middleMix = des.Crypt(binNumberCounterdFixed64, this.key[0]);
					middleMix = des.Crypt(middleMix, this.key[1]);
					middleMix = des.Crypt(middleMix, this.key[2]);


				// Run on all the chars 
				var plainChunkXorCTRNum ='';
				for(var charIndex in plain64chunks[chunk]){
					// middleMix XOR cipher64chunk
					plainChunkXorCTRNum += String(parseInt(plain64chunks[chunk][charIndex]) ^ parseInt(middleMix[charIndex]));
				}

				// Save this cipher for after use
				ciphertextArr.push(plainChunkXorCTRNum);
			}

			return ctrBinNumberFixed64+ciphertextArr.join('');

			break;
	}
	
}
DES3.prototype.Decrypt = function(vecCipherText) {
	// Get & Set all inputs
	this.Init();
	var des = new DES();
	switch (this.opMode){
		case 'CBC':
			var cipher64chunks = chunkString(vecCipherText, 64);	//split str to chunks of 64bit
			
			var iv64 = cipher64chunks.shift();	// initialization vector
			console.log('iv64: '+iv64)

			// Run on all cipher chunks
			var plaintextArr = [];
			for(var chunk in cipher64chunks){

				// crypt the xor result 3 times as 3DES
				var middleMix = des.Decrypt(cipher64chunks[chunk], this.key[2]);
					middleMix = des.Decrypt(middleMix, this.key[1]);
					middleMix = des.Decrypt(middleMix, this.key[0]);

				// Run on all the chars 
				var plaintextChunk ='';
				for(var charIndex in middleMix){
					if (chunk==0){
				 		// iv(64) XOR cipher64chunks(64)
						plaintextChunk += String(parseInt(middleMix[charIndex]) ^ parseInt(iv64[charIndex]));
					}else{
				 		// iv(64) XOR cipher64chunks(64)
						plaintextChunk += String(parseInt(middleMix[charIndex]) ^ parseInt(cipher64chunks[chunk-1][charIndex]));
					}
				}

				// Save this cipher for after use
				plaintextArr.push(plaintextChunk);
			}

			var plaintextBits = plaintextArr.join('');
			var plaintext = fromBitsToText(plaintextBits);
			return plaintext;
			break;
		case 'OFB':
			var plaintextBitsText = BitsArrayFromString(plainText);
			var plaintextBitsAsMultiple64 = plaintextBitsAsMultiple_64(plaintextBitsText); //fix str to be as multiples of 64 bits
			//console.log(plaintextBitsAsMultiple64.length);
			var plain64chunks = chunkString(plaintextBitsAsMultiple64, 64);	//split str to chunks of 64bit

			// iv(64)
			var iv64 = GenerateBits(64);

			// Run on all plaintext chunks
			var ciphertextArr = [];
			for(var chunk in plain64chunks){
				if (chunk==0){
					var middleMix = des.Crypt(iv64, this.key[0]);
						middleMix = des.Crypt(middleMix, this.key[1]);
					var keyIVCipher = des.Crypt(middleMix, this.key[2]);
				}
				// Run on all the chars 
				var plainChunkXorIV ='';
				for(var charIndex in plain64chunks[chunk]){
					if (chunk==0){
						// iv(64) XOR cipher64chunk
						plainChunkXorIV += String(parseInt(plain64chunks[chunk][charIndex]) ^ parseInt(iv64[charIndex]));
					}else{
						// cipher64Chunk-1 XOR cipher64chunk
						plainChunkXorIV += String(parseInt(plain64chunks[chunk][charIndex]) ^ parseInt(ciphertextArr[chunk-1][charIndex]));
					}
				}

				// crypt the xor result 3 times as 3DES
				var middleMix = des.Crypt(plainChunkXorIV, this.key[0]);
					middleMix = des.Crypt(middleMix, this.key[1]);
				var ciphertext = des.Crypt(middleMix, this.key[2]);

				// Save this cipher for after use
				ciphertextArr.push(ciphertext);
			}
			break;
		case 'CTR':
			var cipher64chunks = chunkString(vecCipherText, 64);	//split str to chunks of 64bit
			var num64bits = cipher64chunks.shift();	// CTR 64 bits number
			var ctrDecNumber = parseInt(num64bits,2);

			// Run on all plaintext chunks
			var ciphertextArr = [];
			for(var chunk in plain64chunks){
				var ctrDecNumberCounterd = ctrDecNumber+chunk;
				var binNumberCounterd = (ctrDecNumberCounterd >>> 0).toString(2);
				var binNumberCounterdFixed64 = zeroPattern(binNumberCounterd, 64);

				// crypt the xor result 3 times as 3DES
				var middleMix = des.Crypt(binNumberCounterdFixed64, this.key[0]);
					middleMix = des.Crypt(middleMix, this.key[1]);
					middleMix = des.Crypt(middleMix, this.key[2]);


				// Run on all the chars 
				var plainChunkXorCTRNum ='';
				for(var charIndex in plain64chunks[chunk]){
					// middleMix XOR cipher64chunk
					plainChunkXorCTRNum += String(parseInt(plain64chunks[chunk][charIndex]) ^ parseInt(middleMix[charIndex]));
				}

				// Save this cipher for after use
				ciphertextArr.push(plainChunkXorCTRNum);
			}

			return ctrBinNumberFixed64+ciphertextArr.join('');
			break;
	}
}


function fromBitsToText(bitsStr){
	var charsAsBits = chunkString(bitsStr, 8);
	var text = "";
	for (var charIndex in charsAsBits){
	   text += String.fromCharCode(parseInt(charsAsBits[charIndex], 2))
	}
	return text;
}
function fix64Length(str){
	var strModify = str;
	for (var i=0; i<64-str.length; i++){
		strModify += '0';
	}
	return strModify;
}

function plaintextBitsAsMultiple_64(str) {
	var nullChar = '00000000';
	console.log('length: '+str.length+ 'before: '+str);

	// next 64 multiple
	//var fixLength = Math.ceil( str.length/64 )*64;
	var modifyStr=str;
	while (modifyStr.length % 64 != 0){
		modifyStr += String(nullChar);
	}

	// for (var i=str.length; i<fixLength; i++){
	// // 	modifyStr+= String(0);
	// }

	
	console.log('length: '+modifyStr.length+ 'after: '+modifyStr);
	return modifyStr;
}

function chunkString(str, length) {
  return str.match(new RegExp('.{1,' + length + '}', 'g'));
}

function GenerateBits(length){
	var bits='';
	for (var i=0; i<length; i++){
		bits += String(GenerateBit());
	}
	return bits;
}




// 3DES
function DES(){
	this.rounds = 16;
	this.P = [	15,6,19,20,
				28,11,27,16,
				0,14,22,25,
				4,17,30,9,
				1,7,23,13,
				31,26,2,8,
				18,12,29,5,
				21,10,3,24];

	// 64bit static Initial Permutation tables (use as pointers table)
	this.IpTable = [	57, 49, 41, 33, 25, 17, 9, 1, 
						59, 51, 43, 35, 27, 19, 11, 3, 
						61, 53, 45, 37, 29, 21, 13, 5, 
						63, 55, 47, 39, 31, 23, 15, 7, 
						56, 48, 40, 32, 24, 16,  8, 0, 
						58, 50, 42, 34, 26, 18, 10, 2, 
						60, 52, 44, 36, 28, 20, 12, 4, 
						62, 54, 46, 38, 30, 22, 14, 6];

	// 64bit static Initial Permutation tables (use as pointers table)
	this.IpInvertTable = [	39, 7, 47, 15, 55, 23, 63, 31,
					 		38, 6, 46, 14, 54, 22, 62, 30,
					 		37, 5, 45, 13, 53, 21, 61, 29,
					 		36, 4, 44, 12, 52, 20, 60, 28,
					 		35, 3, 43, 11, 51, 19, 59, 27, 
					 		34, 2, 42, 10, 50, 18, 58, 26, 
					 		33, 1, 41,  9, 49, 17, 57, 25, 
					 		32, 0, 40,  8, 48, 16, 56, 24];

	this.E = [	31,0, 1, 2, 3, 4,
				3, 4, 5, 6, 7, 8,
				7, 8, 9,10,11,12,
				11,12,13,14,15,16,
				15,16,17,18,19,20,
				19,20,21,22,23,24,
				23,24,25,26,27,28,
				27,28,29,30,31, 0 ];

	

	this.S_box = [
					[	// S0
						[14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],
						[0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],
						[4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],
						[15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]
					],[	// S1
						[15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],
						[3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],
						[0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],
						[13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]
					],[	// S2
						[10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],
						[13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],
						[13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],
						[1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]//*check
					],[	// S3
						[7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],
						[13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],
						[10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],
						[3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]
					],[	// S4
						[2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],
						[14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],
						[4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],
						[11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]
					],[	// S5
						[12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],
						[10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],
						[9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],
						[4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]
					],[	// S6
						[4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],
						[13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],
						[1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],
						[6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]
					],[	// S7
						[13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],
						[1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],
						[7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],
						[2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]
					]
		];
}
DES.prototype.Crypt = function (plaintext64BitsStr, key64BitsStr) {
	console.log('Crypt()');
	console.log('(input) plain: '+plaintext64BitsStr);
	console.log('(input) key: '+key64BitsStr);
	// Hash plaintext with IP table
	var mixedText = this.IpHash(plaintext64BitsStr);
	console.log('iphash: '+mixedText)

	// Create 16 keys from 1 input (8 Byte = 7Byte key + 1Byte for err) key
	var keys16 = this.Key16From1Key(key64BitsStr);
	for(var i in keys16){
		console.log('K'+i+'=' +keys16[i]);
	}
	

	// Split mixed text for 2 String: L,R
	mixedText = this.splitLR(mixedText, keys16, 'encrypt');
	

	// Hash again mixedText with IP^-1 table
	var ciphertext = this.IpInvertHash(mixedText);
	console.log('(output) ciphertext: '+ciphertext);
	return ciphertext;
}
DES.prototype.Decrypt = function (ciphertext64BitsStr, key64BitsStr) {
	console.log('Decrypt()');
	console.log('(input) cipher: '+ciphertext64BitsStr);
	console.log('(input) key: '+key64BitsStr);

	// Hash plaintext with IP table
	var mixedText = this.IpInvertHash(ciphertext64BitsStr);
	// Create 16 keys from 1 input (8 Byte = 7Byte key + 1Byte for err) key
	var keys16 = this.Key16From1Key(key64BitsStr);


	// Split mixed text for 2 String: L,R
	mixedText = this.splitLR(mixedText, keys16, 'decrypt');


	// Hash again mixedText with IP^-1 table
	var plaintext = this.IpHash(mixedText);
	console.log('(output) plain is: '+plaintext);
	return plaintext;

}

DES.prototype.IpHash = function (plainText64Bits){//Works good!
	//console.log(plainText64Bits);
	// hash IP
	var genOutput = '';
	for (var i=0; i<64; i++){
		genOutput += String(plainText64Bits[ this.IpTable[i] ]);
	}
	return genOutput;
}
DES.prototype.Key16From1Key = function (key64Bits) {//mixed text of 64 bit
	//for the key 16 the tables should be the same as the start
	//var PC1Plus = [
	// 	56, 48, 40, 32, 24, 16, 8,
	// 	 0, 57, 49, 41, 33, 25,17,
	// 	 9, 1, 58, 50, 42, 34, 26, 
	// 	18, 10, 2, 59, 51, 43, 35,
	// 	62, 54, 46, 38, 30, 22, 14,
	// 	 6, 61, 53, 45, 37, 29, 21, 
	// 	13, 5, 60, 52, 44, 36, 28, 
	// 	20, 12, 4, 27, 19, 11, 3
	// ];

	var PC1 = {
			C: [56, 48, 40, 32, 24, 16, 8,
				 0, 57, 49, 41, 33, 25,17,
				 9, 1, 58, 50, 42, 34, 26, 
				18, 10, 2, 59, 51, 43, 35]
			,
			D: [62, 54, 46, 38, 30, 22, 14,
				 6, 61, 53, 45, 37, 29, 21, 
				13, 5, 60, 52, 44, 36, 28, 
				20, 12, 4, 27, 19, 11, 3]
	};
	var PC2 = [13, 16, 10, 23, 0, 4, 
				 2, 27, 14, 5, 20, 9, 
				22, 18, 11, 3, 25, 7, 
				15, 6, 26, 19, 12, 1, 
				40, 51, 30, 36, 46, 54, 
				29, 39, 50, 44, 32, 47, 
				43, 48, 38, 55, 33, 52, 
				45, 41, 49, 35, 28, 31];

	console.log('(start)PC1:C '+PC1.C);
	console.log('(start)PC1:D '+PC1.D);
	console.log('(start)PC2: '+PC2);
	
	// Create k+ from k
	// var key64BitsPlus = '';
	// for (var i=0; i<56; i++){
	// 	key64BitsPlus += String(key64Bits[ PC1Plus[i] ]);
	// }

	var keys16 = [];
	for (var i=0; i<this.rounds; i++){
		// Do SHIFT LEFT
		if (i in [0,1,8,15]){	//because i start from 0, we will check [0,1,8,15] and not [1,2,9,16]
			/* Do 1 shift - for C,D */
			//C (left shift)
			var startItem = PC1.C.shift();
			PC1.C.push(startItem);
			//D (first shift)
			var startItem = PC1.D.shift();
			PC1.D.push(startItem);
		}else{
			/* Do 2 shift - for C,D */		
			for (var k=0; k<2; k++){
				//C (left shift)
				var startItem = PC1.C.shift();
				PC1.C.push(startItem);

				//D (left shift)
				var startItem = PC1.D.shift();
				PC1.D.push(startItem);
			}
		}


		// Create Ki-bit
		var genKey = [];
		for (var j=0; j<48; j++){
			var ptrptr = PC2[j];
			var ptr;
			if (ptrptr >27){
				// use D table
				ptrptr-=28;	// for illustrate like we pass all C cells and jump to next table D
				ptr = PC1.D[ptrptr];
			}else{
				// use C table
				ptr = PC1.C[ptrptr];
			}
			
			genKey.push(key64Bits[ptr]);
		}
		keys16.push(genKey);
	}
	console.log('(end)PC1:C '+PC1.C);
	console.log('(end)PC1:D '+PC1.D);
	console.log('(end)PC2: '+PC2);
	return keys16;
}


DES.prototype.splitLR = function (mixedTextAsBitsArray, keys16, op) {//mixed text of 64 bit
	console.log('mixedText = '+mixedTextAsBitsArray);

	var L,R;
	if (op=='encrypt'){
		// Split mixedText to L,R every one 32bit
		L = mixedTextAsBitsArray.slice(0,32);
		R = mixedTextAsBitsArray.slice(32,32+64);
		//console.log('L+R: '+ L+'\n'+R);
	}else{
		// Split mixedText to L,R every one 32bit
		R = mixedTextAsBitsArray.slice(0,32);
		L = mixedTextAsBitsArray.slice(32,32+64);
		//console.log('L+R: '+ L+'\n'+R);
	}

	// Make 16 rounds
	for (var i=0; i<this.rounds; i++){
		// Before changes
		var L_before = L;
		var R_before = R;

		// After changes
		L = R_before;			//Li = R i-1
		if (op=='encrypt')	R = this.calcL_XOR_F(L_before, R_before, keys16[i]);	//calc Ri = Li-1 XOR f(Ri-1 , Ki)
		else 				R = this.calcL_XOR_F(L_before, R_before, keys16[this.rounds-i]);	//calc Ri = Li-1 XOR f(Ri-1 , Ki)
	}

	var output;
	if (op=='encrypt')	output = R.concat(L); //R16L16
	else 				output = L.concat(R); //L16R16
	
	return output;
}
/*	
 *	L_before(32bit), 
 *	R_before(32bit), 
 *	keys[i] (48bit)  
 *	output 32bit string
 */
DES.prototype.calcL_XOR_F = function(L_before, R_before, key){
	var calcXor = '';
	var fOutput = this.fCalc(R_before, key);
	for (var i=0; i<32; i++){
		var res = parseInt(L_before[i]) ^ parseInt(fOutput[i]);
		calcXor += String(res);
	}
	return calcXor;
}

	
DES.prototype.fCalc = function(R_before32, key){
	// NEED Q.A
	debugger;
	var R_padding48 = this.f_paddingInputByExpandTable(R_before32);	// padding R(32bit) to 48bit
	var xorArrRes = this.f_xorBetweenRAndKey(R_padding48, key);
	var chunks8of6bits = this.f_split48to8chunks(xorArrRes);
	var joinChunks32Str = this.f_s_boxes(chunks8of6bits);
	var joinChunks32HashStr = this.f_PHash(joinChunks32Str);
	return joinChunks32HashStr;
}
/*	
 *	1) this function padding R_before(32bit) to 48bit
 *		output 48bit array
 */
DES.prototype.f_paddingInputByExpandTable = function(R_before32){
	//console.log(R_before32);
	// padding R to 48
	//var R_padding48 = [];
	var R_padding48 = '';
	for (var i=0; i<48; i++){
		R_padding48 += String(R_before32[ this.E[i] ]);
	}
	return R_padding48;
}
/*	
 *	2) this function calc XOR between R_padding48(48bit), key(48bit)
 *		output 48bit array
 */
DES.prototype.f_xorBetweenRAndKey = function(R_padding48, key){
	debugger;
	var xorArrRes = '';
	for (var i=0; i<48; i++){
		var temp = parseInt(R_padding48[i]) ^ parseInt(key[i]);
		xorArrRes += String(temp);
	}
	return xorArrRes;
}
/*	
 *	3.a) this function split the xor-result(48bit) into 8 chunks of (6bit)
 *		output 8 cells array with 6bits every one.
 *		[111111,010101,000000,...]
 */
DES.prototype.f_split48to8chunks = function(xorArrRes){
	var chunks8of6bits = [];
	for(var i=0; i<8; i++){
		chunks8of6bits.push( String(xorArrRes.slice(i*6, (i*6)+6) ) );//checked
	}
	return chunks8of6bits;
}
/*	
 *	3.b) this function calc every chunk(6bit) in s_boxes to get a new (4bit)
 *		4bits*8 = 32bits as string
 */
DES.prototype.f_s_boxes = function(chunks8of6bits){
	var chunks32bits = '';
	for(var i=0; i<8; i++){
		var leftBit = chunks8of6bits[i][0];
		var rightBit = chunks8of6bits[i][5];
		var leftRightBitsStr = leftBit+''+rightBit;		
		var line = parseInt(leftRightBitsStr,2);

		var mid1 = chunks8of6bits[i][1];
		var mid2 = chunks8of6bits[i][2];
		var mid3 = chunks8of6bits[i][3];
		var mid4 = chunks8of6bits[i][4];
		var middleBitsStr = mid1+''+mid2+''+mid3+''+mid4;
		var column = parseInt(middleBitsStr,2);
		// Get (4bits) from S-Box[i]
		var s_box_res = this.S_box[i][line][column];
		var s_box_res_4bits = dec2bin(s_box_res);
		chunks32bits += s_box_res_4bits;
	}
	return chunks32bits;
}
/*	
 *	4) this function hash allChunks32(32bit) with P table
 *		output 32bit string
 */
DES.prototype.f_PHash = function(joinChunks32){
	// padding R to 48
	var joinChunks32Hash = '';
	for (var i=0; i<32; i++){
		joinChunks32Hash += String(joinChunks32[ this.P[i] ]);
	}
	//var joinChunks32HashStr = joinChunks32Hash.join('');
	return joinChunks32Hash;
}



	/*	
	 *	L_before(32bit), 
	 *	R_before(32bit), 
	 *	keys[i] (48bit)  
	 *	output 32bit string
	 */
	// function calcL_XOR_F(L_before, R_before, key){
	// 	var calcXor = '';
	// 	var fOutput = fCalc(R_before, key);
	// 	for (var i=0; i<32; i++){
	// 		var temp = parseInt(L_before[i]) ^ parseInt(fOutput[i]);
	// 		calcXor += String(temp);
	// 	}
	// 	return calcXor;
	// }

	
	// function fCalc(R_before32, key){
	// 	// NEED Q.A
	// 	var R_padding48 = this.f_paddingInputByExpandTable(R_before32);	// padding R(32bit) to 48bit
	// 	var xorArrRes = this.f_xorBetweenRAndKey(R_padding48, key);
	// 	var chunks8of6bits = this.f_split48to8chunks(xorArrRes);
	// 	var joinChunks32Str = this.f_s_boxes(chunks8of6bits);
	// 	var joinChunks32HashStr = this.f_PHash(joinChunks32Str);
	// 	return joinChunks32HashStr;
	// }
	/*	
	 *	1) this function padding R_before(32bit) to 48bit
	 *		output 48bit array
	 */
	// function f_paddingInputByExpandTable(R_before32){

	// 	//console.log(R_before32);
	// 	// padding R to 48
	// 	var R_padding48 = '';
	// 	for (var i=0; i<48; i++){
	// 		R_padding48 += String( R_before32[ this.E[i] ]);
	// 	}
	// 	return R_padding48;
	// }
	/*	
	 *	2) this function calc XOR between R_padding48(48bit), key(48bit)
	 *		output 48bit array
	 */
	// function f_xorBetweebRAndKey(R_padding48, key){
	// 	var xorArrRes = [];
	// 	for (var i=0; i<48; i++){
	// 		var temp = parseInt(R_padding48[i]) ^ parseInt(key[i]);
	// 		xorArrRes += String(temp);
	// 	}
	// 	return xorArrRes;
	// }
	/*	
	 *	3.a) this function split the xor-result(48bit) into 8 chunks of (6bit)
	 *		output 8 cells array with 6bits every one.
	 *		[111111,010101,000000,...]
	 */
	// function f_split48to8chunks(xorArrRes){
	// 	var chunks8of6bits = '';
	// 	for(var i=0; i<8; i++){
	// 		chunks8of6bits += String( xorArrRes.slice(i*6, (i*6)+6) );
	// 	}
	// 	return chunks8of6bits;
	// }
	/*	
	 *	3.b) this function calc every chunk(6bit) in s_boxes to get a new (4bit)
	 *		4bits*8 = 32bits as string
	 */
	// function f_s_boxes(chunks8of6bits){
	// 	var chunks8of4bits = [];
	// 	for(var i=0; i<8; i++){
	// 		var leftBit = chunks8of6bits[i][0];
	// 		var rightBit = chunks8of6bits[i][5];
	// 		var leftRightBitsStr = leftBit+''+rightBit;		
	// 		var line = parseInt(leftRightBitsStr,2);

	// 		var mid1 = chunks8of6bits[i][1];
	// 		var mid2 = chunks8of6bits[i][2];
	// 		var mid3 = chunks8of6bits[i][3];
	// 		var mid4 = chunks8of6bits[i][4];
	// 		var middleBitsStr = mid1+''+mid2+''+mid3+''+mid4;
	// 		var column = parseInt(middleBitsStr,2);

	// 		// Get (4bits) from S-Box[i]
	// 		var s_box_res = this.S_box[i][line][column];
	// 		var s_box_res_bits = dec2bin(s_box_res);
	// 		var s_box_res_bits4Fixed = fixedInputTo4Bits(s_box_res_bits);
	// 		chunks8of4bits.push(s_box_res_bits4Fixed);
	// 	}
	// 	var joinChunks32Str = chunks8of4bits.join('');
	// 	return joinChunks32Str;
	// }
	/*	
	 *	4) this function hash allChunks32(32bit) with P table
	 *		output 32bit string
	 */
	// function f_PHash(joinChunks32){
	// 	// padding R to 48
	// 	var joinChunks32Hash = '';
	// 	for (var i=0; i<48; i++){
	// 		joinChunks32Hash += String( joinChunks32[ this.P[i] ] );
	// 	}
	// 	//var joinChunks32HashStr = joinChunks32Hash.join('');
	// 	return joinChunks32Hash;
	// }

DES.prototype.IpInvertHash = function (mixedText64Bits){// Works good.
	//console.log(mixedText64Bits);
	// hash IP
	var genOutput = '';
	for (var i=0; i<64; i++){
		genOutput += String( mixedText64Bits[ this.IpInvertTable[i] ] );
	}
	return genOutput;
}




function GenerateBit(){
	return Math.round( Math.random() );
}

// function GenerateKey(length) {
//   for(var i=0, key = []; i < length; ++i)
//       key[i] = 1 + ((Math.random() * 255) << 0);
//   return String.fromCharCode.apply(String, key);
// }
function BitsArrayFromString(str){
	//var nullChar = 0;// =0x0D;
	//var LINE_FEED = 10; //= 0x0A;

	var bits = '';
	for(var i=0; i<str.length; i++){
		var strBits = str.charCodeAt(i).toString(2);
		var strBitsPad = zeroPattern(strBits,8);	//str 8 bit length
		bits += strBitsPad;
	}
	//bits += zeroPattern( String( Number(CR).toString(2)) ,8);	// Add Carrige return 
	//console.log('BitsArrayFromString()\nbits: '+bits+' length\n'+bits.length)
	return bits;
}


// function PaddingTo64Bits(key) {
// 	var paddingKey = key;
// 	for (var i=key.length; i<64; i++){
// 		paddingKey.push(0);	//as bit
// 	}
// 	return paddingKey;
// }
// function PaddingTo192Bits(key) {
// 	var paddingKey = key;
// 	for (var i=key.length; i<192; i++){
// 		paddingKey.push(0);	//as bit
// 	}
// 	return paddingKey;
// }

function dec2bin(dec){
    return zeroPattern( (dec >>> 0).toString(2), 4);
}

function zeroPattern(binariNum, patternLength){
	var pattern = '';
	for(i=0; i<patternLength; i++){
		pattern += '0';
	}
	return pattern.slice(String(binariNum).length) + binariNum
}
// function fixedInputTo4Bits(numAsStr){
// 	for(var i=numAsStr.length; i<4; i++){
// 		numAsStr = '0'+numAsStr;
// 	}
// 	return numAsStr;
// }