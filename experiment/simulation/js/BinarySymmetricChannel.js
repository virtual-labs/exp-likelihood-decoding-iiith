const GeneratorMatricesBSC = [
    {
        name: "G1",
        gen: [[1,0,0,1],[0,1,1,1]]},
    {
        name: "G2",
        gen: [[1,0,0,0,1,1],[0,1,0,1,0,1],[0,0,1,1,1,0]]},
    {
        name: "G3",
        gen: [[1,0,1,1,0],[0,1,0,1,1],[0,0,1,0,1]]},
]

const extravectorsbsc4 = [[1,1,0,0],[0,1,0,1],[0,1,1,0],[1,1,1,1]];
const extravectorsbsc5 = [[0,0,0,0,1],[0,1,1,1,0],[1,0,1,0,0],[0,1,1,1,1],[1,0,1,1,1],[1,1,1,1,0]];
const extravectorsbsc6 = [[0,0,0,0,0,1],[0,1,1,1,0,0],[1,0,1,0,0,1],[1,0,0,1,0,1],[1,1,0,1,1,1],[1,0,0,0,1,0]];


// Function to generate codewords for a matrix
function generateCodewordsBSC(matrix) {
    const codewords = [];
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    // Generate all possible message vectors of length numRows
    for (let i = 0; (1 << numRows) > i; i++) {
        const messageVector = Array(numRows).fill(0).map((_, bit) => (i >> bit) & 1);
        const codeword = matrix[0].map((_, colIndex) => {
            return matrix.reduce((sum, row, rowIndex) => (sum + row[colIndex] * messageVector[rowIndex]) % 2, 0);
        });
        codewords.push(codeword);
    }

    return codewords;
}

// Function to introduce random bit flips in a codeword
function introduceBitFlips(codeword) {
    // Decide randomly whether to introduce 1 or 2 bit flips
    const numbitflips = Math.random() < 0.5 ? 1 : 2;

    // Create a set of unique random positions to bit flip
    const bitflipPositions = new Set();

    while (bitflipPositions.size < numbitflips) {
        const randomIndex = Math.floor(Math.random() * codeword.length);
        bitflipPositions.add(randomIndex);
    }

    // Apply the bit flips to the codeword
    const bitflippedCodeword = codeword.map((bit, index) => (
        bitflipPositions.has(index) ? (bit === 0 ? 1 : 0) : bit
    ));

    return bitflippedCodeword;
}

function introduceMoreBitFlips(newcodewords) {
    // Decide randomly whether to introduce 1 or 2 bitflips
    if (newcodewords.length === 4){
        numbitflips = Math.random() < 0.5 ? 2 : 3;
    }
    else {
        numbitflips = Math.random() < 0.5 ? 3 : 4;
    }

    // Create a set of unique random positions to erase
    const bitflipPositions = new Set();

    while (bitflipPositions.size < numbitflips) {
        const randomIndex = Math.floor(Math.random() * newcodewords.length);
        bitflipPositions.add(randomIndex);
    }

    // Apply the bit flips to the codeword
    const bitflippedCodeword = newcodewords.map((bit, index) => (
        bitflipPositions.has(index) ? (bit === 0 ? 1 : 0) : bit
    ));

    return bitflippedCodeword;
}

const randomNum = Math.floor(Math.random() * 3);

// Generate a random binary matrix
G = GeneratorMatricesBSC[randomNum].gen;

// Generate all codewords
let codewords = generateCodewordsBSC(G);

// Choose a single random codeword from the generated codewords
let chosenCodeword = codewords[Math.floor(Math.random() * codewords.length)];

// Apply bitflips to the chosen codeword
let receivedCodeword = introduceBitFlips(chosenCodeword);


const pBSC = 0.2;

GM = GeneratorMatricesBSC[randomNum].gen;

let newcodewords = generateCodewordsBSC(GM);
let newchosenCodeword = newcodewords[Math.floor(Math.random() * newcodewords.length)];

let receivedOutput = introduceMoreBitFlips(newchosenCodeword);

// Function to calculate the likelihood of each codeword given the received codeword
function calculateLikelihoodBSC(codewords, receivedCodeword, pBSC) {
    let likelihoods = [];

    codewords.forEach((codeword, index) => {
        let bitsame = 0;
        let bitflipped = 0;

        // Check compatibility and count non-erasure/erasure bits
        for (let i = 0; i < codeword.length; i++) {
            if (receivedCodeword[i] !== codeword[i]) {
                bitflipped++;
            }
            else {
                bitsame++;
            }
        }

        const likelihood = Math.pow(pBSC, bitflipped) * Math.pow(1 - pBSC, bitsame);
        likelihoods.push({
            codeword: index,
            likelihood: parseFloat(likelihood.toFixed(3)),
            pe: parseInt(bitflipped),
            npe: parseInt(bitsame)
            });
    });

    return likelihoods;
}

// Function to update the HTML content with the chosen codeword
function updateCodewordsBSC() {
    const codewordsElementBSC = document.getElementById('codewordsSymmetric');
    const codewordsElement = document.getElementById('codewordsbsc');
    const maxlikelihoodansbsc = document.getElementById('dropdowncodewordsbsc');

    let codewordsText = '';
    codewords.forEach((value, index) => {
        codewordsText += `\\( \\boldsymbol{c_${index + 1}} \\) = (${value.join(', ')}), `;
    });
    codewordsElement.innerHTML = `Consider a BSC Channel with p = ${pBSC} and a code \\( \\mathcal{C} \\) = {${codewordsText}}`;

    // Generate HTML for likelihood calculations dynamically
    let likelihoodHTML = '';
    codewords.forEach((_, index) => {
        likelihoodHTML += `
            <div id="powerText">
                <span> \\( \\boldsymbol{p(y|c_${index + 1})} \\)</span> = <i>p</i><sup><input type="number" class="superscript" id="c${index + 1}_power1bsc" min="0"></sup>
                <i>(1-p)</i><sup><input type="number" class="superscript" id="c${index + 1}_power2bsc" min="0"></sup>
                = <input type="number" class="input-likeli" id="c${index + 1}_likelihoodbsc">
            </div>
        `;
    });
    codewords.forEach((value, index) => {
        maxlikelihoodansbsc.innerHTML += `<a onclick="verifyMaxLikelihood(${index})" id="c${index + 1}">\\( c_${index + 1} \\)</a>`
    });
    codewordsElementBSC.innerHTML = `Enter the likelihood of receiving the output vector \\( \\boldsymbol{y} \\) = (${receivedCodeword.join(', ')}) given each of the codewords. Then select the codeword that has the maximum likelihood of being transmitted. ${likelihoodHTML}`;
}

const likelihoods = calculateLikelihoodBSC(codewords, receivedCodeword, pBSC);

// Function to check the user-entered likelihoods and provide feedback
function checkLikelihoodBSC() {
    let likelihoodarray = [];
    let erasurearray1 = [];
    let erasurearray2 = [];

    codewords.forEach((value, index) => {
        let cw = document.getElementById(`c${index + 1}_likelihoodbsc`);
        let bs = document.getElementById(`c${index + 1}_power1bsc`);
        let bf = document.getElementById(`c${index + 1}_power2bsc`);

        likelihoodarray[index] = parseFloat(cw.value);
        erasurearray1[index] = parseInt(bs.value);
        erasurearray2[index] = parseInt(bf.value);
    });

    const p1obsa = document.getElementById('mEntered');
    

    if(likelihoodarray.length === 4){
        switch (true) {
            case (likelihoods[0].likelihood != parseFloat(likelihoodarray[0]) && likelihoods[1].likelihood != parseFloat(likelihoodarray[1]) && likelihoods[2].likelihood != parseFloat(likelihoodarray[2]) && likelihoods[3].likelihood != parseFloat(likelihoodarray[3])):
                p1obsa.innerHTML = "Incorrect Answers! <br> Please go through the Instructions and try again.";
                p1obsa.style.color = "red";
                break;

            case ((likelihoods[0].pe != parseInt(erasurearray1[0])) || (likelihoods[0].npe != parseInt(erasurearray2[0])) || (likelihoods[0].likelihood != parseFloat(likelihoodarray[0]))):
                    if(likelihoods[0].npe != parseInt(erasurearray2[0])){
                        p1obsa.innerHTML = `Kindly check the number of non-bitflips in the received vector for the codeword \\( c_1 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[0].pe != parseInt(erasurearray1[0])){
                        p1obsa.innerHTML = `Kindly check the number of bitflips in the received vector for the codeword \\( c_1 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of bitflips and non-bitflips and enter the correct answer for the codeword \\( c_1 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
            
            case ((likelihoods[1].pe != parseInt(erasurearray1[1])) || (likelihoods[1].npe != parseInt(erasurearray2[1])) || (likelihoods[1].likelihood != parseFloat(likelihoodarray[1]))):
                    if(likelihoods[1].npe != parseInt(erasurearray2[1])){
                        p1obsa.innerHTML = `Kindly check the number of non-bitflips in the received vector for the codeword \\( c_2 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[1].pe != parseInt(erasurearray1[1])){
                        p1obsa.innerHTML = `Kindly check the number of bitflips in the received vector for the codeword \\( c_2 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of bitflips and non-bitflips and enter the correct answer for the codeword \\( c_2 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }

            case ((likelihoods[2].pe != parseInt(erasurearray1[2])) || (likelihoods[2].npe != parseInt(erasurearray2[2])) || (likelihoods[2].likelihood != parseFloat(likelihoodarray[2]))):
                    if(likelihoods[2].npe != parseInt(erasurearray2[2])){
                        p1obsa.innerHTML = `Kindly check the number of non-bitflips in the received vector for the codeword \\( c_3 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[2].pe != parseInt(erasurearray1[2])){
                        p1obsa.innerHTML = `Kindly check the number of bitflips in the received vector for the codeword \\( c_3 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of bitflips and non-bitflips and enter the correct answer for the codeword \\( c_3 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }


            case ((likelihoods[3].pe != parseInt(erasurearray1[3])) || (likelihoods[3].npe != parseInt(erasurearray2[3])) || (likelihoods[3].likelihood != parseFloat(likelihoodarray[3]))):
                    if(likelihoods[3].npe != parseInt(erasurearray2[3])){
                        p1obsa.innerHTML = `Kindly check the number of non-bitflips in the received vector for the codeword \\( c_4 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[3].pe != parseInt(erasurearray1[3])){
                        p1obsa.innerHTML = `Kindly check the number of bitflips in the received vector for the codeword \\( c_4 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of bitflips and non-bitflips and enter the correct answer for the codeword \\( c_4 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
        
            default:
                p1obsa.innerHTML = "All the likelihoods entered are correct!";
                p1obsa.style.color = "green";
                break;
        }
    }
    else{
        switch (true) {

            case (likelihoods[0].likelihood != parseFloat(likelihoodarray[0]) && likelihoods[1].likelihood != parseFloat(likelihoodarray[1]) && likelihoods[2].likelihood != parseFloat(likelihoodarray[2]) && likelihoods[3].likelihood != parseFloat(likelihoodarray[3]) && likelihoods[4].likelihood != parseFloat(likelihoodarray[4]) && likelihoods[5].likelihood != parseFloat(likelihoodarray[5]) && likelihoods[6].likelihood != parseFloat(likelihoodarray[6]) && likelihoods[7].likelihood != parseFloat(likelihoodarray[7])):
                p1obsa.innerHTML = "Incorrect Answer! <br> Please go through the Instructions, and try again.";
                p1obsa.style.color = "red";
                break;
            
            case ((likelihoods[0].pe != parseInt(erasurearray1[0])) || (likelihoods[0].npe != parseInt(erasurearray2[0])) || (likelihoods[0].likelihood != parseFloat(likelihoodarray[0]))):
                    if(likelihoods[0].npe != parseInt(erasurearray2[0])){
                        p1obsa.innerHTML = `Kindly check the number of non-bitflips in the received vector for the codeword \\( c_1 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[0].pe != parseInt(erasurearray1[0])){
                        p1obsa.innerHTML = `Kindly check the number of bitflips in the received vector for the codeword \\( c_1 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of bitflips and non-bitflips and enter the correct answer for the codeword \\( c_1 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
            
            case ((likelihoods[1].pe != parseInt(erasurearray1[1])) || (likelihoods[1].npe != parseInt(erasurearray2[1])) || (likelihoods[1].likelihood != parseFloat(likelihoodarray[1]))):
                    if(likelihoods[1].npe != parseInt(erasurearray2[1])){
                        p1obsa.innerHTML = `Kindly check the number of non-bitflips in the received vector for the codeword \\( c_2 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[1].pe != parseInt(erasurearray1[1])){
                        p1obsa.innerHTML = `Kindly check the number of bitflips in the received vector for the codeword \\( c_2 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of bitflips and non-bitflips and enter the correct answer for the codeword \\( c_2 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }

            case ((likelihoods[2].pe != parseInt(erasurearray1[2])) || (likelihoods[2].npe != parseInt(erasurearray2[2])) || (likelihoods[2].likelihood != parseFloat(likelihoodarray[2]))):
                    if(likelihoods[2].npe != parseInt(erasurearray2[2])){
                        p1obsa.innerHTML = `Kindly check the number of non-bitflips in the received vector for the codeword \\( c_3 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[2].pe != parseInt(erasurearray1[2])){
                        p1obsa.innerHTML = `Kindly check the number of bitflips in the received vector for the codeword \\( c_3 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of bitflips and non-bitflips and enter the correct answer for the codeword \\( c_3 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }

            case ((likelihoods[3].pe != parseInt(erasurearray1[3])) || (likelihoods[3].npe != parseInt(erasurearray2[3])) || (likelihoods[3].likelihood != parseFloat(likelihoodarray[3]))):
                    if(likelihoods[3].npe != parseInt(erasurearray2[3])){
                        p1obsa.innerHTML = `Kindly check the number of non-bitflips in the received vector for the codeword \\( c_4 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[3].pe != parseInt(erasurearray1[3])){
                        p1obsa.innerHTML = `Kindly check the number of bitflips in the received vector for the codeword \\( c_4 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of bitflips and non-bitflips and enter the correct answer for the codeword \\( c_4 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }

            case ((likelihoods[4].pe != parseInt(erasurearray1[4])) || (likelihoods[4].npe != parseInt(erasurearray2[4])) || (likelihoods[4].likelihood != parseFloat(likelihoodarray[4]))):
                    if(likelihoods[4].npe != parseInt(erasurearray2[4])){
                        p1obsa.innerHTML = `Kindly check the number of non-bitflips in the received vector for the codeword \\( c_5 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[4].pe != parseInt(erasurearray1[4])){
                        p1obsa.innerHTML = `Kindly check the number of bitflips in the received vector for the codeword \\( c_5 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of bitflips and non-bitflips and enter the correct answer for the codeword \\( c_5 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }

            
            case ((likelihoods[5].pe != parseInt(erasurearray1[5])) || (likelihoods[5].npe != parseInt(erasurearray2[5])) || (likelihoods[5].likelihood != parseFloat(likelihoodarray[5]))):
                    if(likelihoods[5].npe != parseInt(erasurearray2[5])){
                        p1obsa.innerHTML = `Kindly check the number of non-bitflips in the received vector for the codeword \\( c_6 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[5].pe != parseInt(erasurearray1[5])){
                        p1obsa.innerHTML = `Kindly check the number of bitflips in the received vector for the codeword \\( c_6 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of bitflips and non-bitflips and enter the correct answer for the codeword \\( c_6 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }


            case ((likelihoods[6].pe != parseInt(erasurearray1[6])) || (likelihoods[6].npe != parseInt(erasurearray2[6])) || (likelihoods[6].likelihood != parseFloat(likelihoodarray[6]))):
                    if(likelihoods[6].npe != parseInt(erasurearray2[6])){
                        p1obsa.innerHTML = `Kindly check the number of non-bitflips in the received vector for the codeword \\( c_7 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[6].pe != parseInt(erasurearray1[6])){
                        p1obsa.innerHTML = `Kindly check the number of bitflips in the received vector for the codeword \\( c_7 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of bitflips and non-bitflips and enter the correct answer for the codeword \\( c_7 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }

            case ((likelihoods[7].pe != parseInt(erasurearray1[7])) || (likelihoods[7].npe != parseInt(erasurearray2[7])) || (likelihoods[7].likelihood != parseFloat(likelihoodarray[7]))):
                    if(likelihoods[7].npe != parseInt(erasurearray2[7])){
                        p1obsa.innerHTML = `Kindly check the number of non-bitflips in the received vector for the codeword \\( c_8 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else if(likelihoods[7].pe != parseInt(erasurearray1[7])){
                        p1obsa.innerHTML = `Kindly check the number of bitflips in the received vector for the codeword \\( c_8 \\).`;
                        p1obsa.style.color = "red";
                        break;
                    }
                    else{
                        p1obsa.innerHTML = `Kindly make sure you check the number of bitflips and non-bitflips and enter the correct answer for the codeword \\( c_8 \\) again.`;
                        p1obsa.style.color = "red";
                        break;
                    }
        
            default:
                p1obsa.innerHTML = "All the likelihoods entered are correct!";
                p1obsa.style.color = "green";
                break;
        }
    }

    MathJax.typesetPromise();

    console.log(likelihoods);
    console.log(likelihoodarray);
    console.log(erasurearray1);
    console.log(erasurearray2);
}

function verifyMaxLikelihood(code) {

    let maxLikelihood = 0;
    let maxLikelihoodIndex = 0;

    likelihoods.forEach((likeli, index) => {
        if (likeli.likelihood > maxLikelihood) {
            maxLikelihood = likeli.likelihood;
            maxLikelihoodIndex = index;
        }
    });

    const p1obsb = document.getElementById('cEntered');

    if (code === maxLikelihoodIndex){
        p1obsb.innerHTML = "The maximum likelihood codeword selected is correct.";
        p1obsb.style.color = "green";
    }
    else{
        p1obsb.innerHTML = "The maximum likelihood codeword selected is incorrect.";
        p1obsb.style.color = "red";
    }
}

// Function to reset all received bits to 0 and reset attempts counter
function reset() {
    document.querySelectorAll('.input-likeli').forEach(input => {
        input.value = '';
    });
    document.getElementById('observations').innerHTML = '';
}

// Call the function to update the content
updateCodewordsBSC();

var buttonIdentityBSC = ["j1", "j2", "j3", "j4","j5", "j6", "j7", "j8"];

const buttonIdentity = buttonIdentityBSC.slice();

var correctbuttons = [];
var wrongbuttons = [];

var correctcodewordsarray = [];
var wrongcodewordsarray = [];

for (let i = buttonIdentity.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [buttonIdentity[i], buttonIdentity[j]] = [buttonIdentity[j], buttonIdentity[i]];
}

function next(){

    document.getElementById("part2bsc").style.display = "block";
    document.getElementById("part1bsc").style.display = "none";

    buttonIdentity.forEach(function(buttonId) {
        // Get the button element
        var buttons = document.getElementById(buttonId);
        
        // Set the random number as the button's text
        buttons.style.backgroundColor = "";
    });

    const codewordsElements = document.getElementById('linearcodebsc');
    const transmittedcodeword = document.getElementById('transmittedcodewordbsc');

    let codewordstxt = '';
    newcodewords.forEach((value, index) => {
        codewordstxt += `\\( \\boldsymbol{c_${index + 1}} \\) = (${value.join(', ')}), `;
    });
    codewordsElements.innerHTML = `Consider the code \\( \\mathcal{C} \\) = {${codewordstxt}}`;

    transmittedcodeword.innerHTML = `Consider a output \\( \\boldsymbol{y} \\) = (${receivedOutput.join(', ')}) that was received from a BSC Channel. Select all of the below vectors which cannot be the possible inputs to the BSC Channel.`;

    var i = 0;
    const randomNumbers = (() => { let a = Math.floor(Math.random() * 6) + 1; let b; do { b = Math.floor(Math.random() * 6) + 1; } while (a === b); return [a, b]; })();

    buttonIdentity.forEach(function(wansbutton) {
        // Get the button element
        var buttonw = document.getElementById(wansbutton);

        if((newcodewords[0].length) === 4){
            if(i >= 4){
                randomcodewords = extravectorsbsc4[i-4];
            }
            else{
                randomcodewords = newcodewords[i];
            }
        }
        else if((newcodewords[0].length) === 5){
            if(i >= 2){
                randomcodewords = extravectorsbsc5[i-2];
            }
            else{
                randomcodewords = newcodewords[randomNumbers[i]];
            } 
        }
        else{
            if(i >= 2){
                randomcodewords = extravectorsbsc6[i-2];
            }
            else{
                randomcodewords = newcodewords[randomNumbers[i]];
            }
        }
    
        if (newcodewords.includes(randomcodewords)) {
            if (!wrongbuttons.includes(buttonw.id)){
                wrongcodewordsarray.push(randomcodewords);
                wrongbuttons.push(buttonw.id);
            }
        } else {
            if (!correctbuttons.includes(buttonw.id)){
            correctcodewordsarray.push(randomcodewords);
            correctbuttons.push(buttonw.id);
            }
        }

        buttonw.innerHTML = `<span style="font-size: 20px; font-weight: bold; color: black;">` + `(${randomcodewords.join(', ')})` + `</span>`;
        i = i + 1;
    });

    MathJax.typesetPromise();

    console.log(correctbuttons);
    console.log(wrongbuttons);
    console.log(correctcodewordsarray);
    console.log(wrongcodewordsarray);
    
}

var array2 = [];

function change(id) {
    const element = document.getElementById(id);

    if (element.style.backgroundColor === "rgb(26, 255, 0)") {
        element.style.backgroundColor = "rgb(200, 200, 200)";
            const index = array2.indexOf(id);
            if (index !== -1) {
                array2.splice(index, 1);
            }
}   else {
        element.style.backgroundColor = "rgb(26, 255, 0)";
        array2.push(id);
    }
}

function checkwrongcodewords(){
    const newobservations = document.getElementById("newobservations");
    const newcEntered = document.getElementById("newcEntered");
    const selectedCodewords = document.querySelectorAll('#part2bsc .outputcw button[style="background-color: rgb(26, 255, 0);"]');

    if (selectedCodewords.length == 0) {
        newobservations.innerHTML = "No output codeword has been selected. Kindly choose the codewords by clicking on them.";
        newobservations.style.color = "black";
    }
    else {
        const selectedIds = Array.from(selectedCodewords).map(button => button.id);
        const correctIds = correctbuttons.slice();
        const isCorrect = correctIds.every(id => selectedIds.includes(id)) && selectedIds.length === correctIds.length;


        if (isCorrect) {
            newobservations.innerHTML = "";
            correctcodewordsarray.forEach(function(ccarray){
                newobservations.innerHTML += `(${ccarray})`;
        });
            newobservations.innerHTML += `<br><b>Correct! The above selected output vectors are indeed the right possible outputs for the given codeword.</b>`;
            newobservations.style.color = "green";
            newcEntered.innerHTML = "";
        } else {
            newobservations.innerHTML = "<b>Kindly check as to what the correct output vectors could be by going through the theory.</b>";
            newobservations.style.color = "red";
            newcEntered.innerHTML = "";
        }
    }
}

function prev(){
    document.getElementById("part2bsc").style.display = "none";
    document.getElementById("part1bsc").style.display = "block";
}