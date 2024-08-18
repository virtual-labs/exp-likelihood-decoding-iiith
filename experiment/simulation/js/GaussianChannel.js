const codewords = [
    {
        codeword: [1, 1, 1, 1],
    },
    {
        codeword: [-1, 1, -1, 1],
    },
    {
        codeword: [1, -1, 1, -1],
    },
    {
        codeword: [-1, -1, -1, -1],
    },
];

const receivedCodewords = {
    0: { codewords: [[-1.62, -1.54, 1.73, 2.35], [1.13, -1.47, 0.76, 2.34], [1.62, -1.54, 1.73, -2.35],  [-1.16, -1.74, 0.73, -1.53]], mlError : [2, 3] },
    1: {codewords: [[1.26, 1.93, -1.32, 5.35], [1.62, -1.54, 1.73, -2.35], [-1.62, -1.54, 1.73, 2.35], [-1.16, -1.74, 0.73, -1.53]], mlError : [1,2,3]},   
    2: {codewords: [[1.26, 1.93, -1.32, 5.35], [1.62, -1.54, 1.73, -2.35], [-1.62, -1.54, 1.73, 2.35], [2.46, -1.13, 1.42, 0.70]], mlError : [0,2]},
    3: {codewords: [[-1.16, -1.74, 0.73, -1.53], [-2.09, -0.21, -1.44, -0.31], [-2.22, -1.54, -1.73, -2.35], [2.46, -1.13, 1.42, 0.70]], mlError : [3]},
}

var likelihoods = {}; //stores likelihoods for each codeword in form of y-x norm

var randomRandomCodeword = selectRandomCodeword();
var probabilityFlip = Math.random();
var noiseVariance = Math.floor(Math.random() * 5) + 1;

document.getElementById("noisevariance").innerHTML = noiseVariance;

var noise = parseFloat(gaussianRV(0, Math.sqrt(noiseVariance))().toFixed(2)); // clip to 2 decimal places
var sentX = randomRandomCodeword.codeword;
var receivedY; //= sentX + noise  // send 0 or 1
// var dim = randomGeneratorMatrix.dim;+

// var codelength = randomGeneratorMatrix.matrix[0].length;

document.getElementById("sentCodeword").innerHTML = "\\(\\boldsymbol{X}=\\)" + formatMatrix(sentX);

// create a noise vector
noise = [];

for (let i = 0; i < sentX.length; i++) {
    noise.push(parseFloat(gaussianRV(0, Math.sqrt(noiseVariance))().toFixed(2)));
}

receivedY = sentX.map((bit, index) => {
    return (bit + noise[index]).toFixed(2);
});

document.getElementById("receivedCodeword").innerHTML = "\\(\\boldsymbol{Y}=\\)" + formatMatrix(receivedY);
// compile MathJax
// MathJax.typeset();
// document.getElementById("receivedCodeword").innerHTML = formatMatrix(receivedCodeword);
// }
// document.getElementById("sentCodword").innerHTML = formatMatrix(randomRandomCodeword.codeword);
// document.getElementById("matrixInfo").innerHTML = "Dimensions: " + randomGeneratorMatrix.dim.join("x") + ", Length: " + randomGeneratorMatrix.length;


// https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
function gaussianRV(mean, stdev) {
    let y2;
    let use_last = false;
    return function () {
        var y1;
        if (use_last) {
            y1 = y2;
            use_last = false;
        } else {
            let x1, x2, w;
            do {
                x1 = 2.0 * Math.random() - 1.0;
                x2 = 2.0 * Math.random() - 1.0;
                w = x1 * x1 + x2 * x2;
            } while (w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w)) / w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
        }

        var retval = mean + stdev * y1;
        //   if (retval > 0)
        return retval;
        //   return -retval;
    }
}

function selectRandomCodeword() {
    const randomIndex = Math.floor(Math.random() * codewords.length);
    return codewords[randomIndex];
}


function verifyMaxLikelihood(codeword) {
    if (codeword == sentX) {
        return true;
    }
    return false;
}


function checkLikelihood(code) {
    const errorEpsilon = 0.1;
    const likelihoodQuestionObservation = document.getElementById("likelihoodQuestionObservation");

    let codeWord = codewords[code].codeword;
    // select the input element with the id of likelihood and id of code c_1
    let N_0_first = parseFloat(document.querySelectorAll(`.likelihood-${code} .mathContainer #N_0_first`)[0].value);
    let N_0_second = parseFloat(document.querySelectorAll(`.likelihood-${code} .mathContainer #N_0_second`)[0].value);
    let y_x_norm = parseFloat(document.querySelectorAll(`.likelihood-${code} .mathContainer #y_x`)[0].value);

    let N_0_first_answer = Math.pow(2 * noiseVariance, sentX.length);
    let N_0_second_answer = 2 * noiseVariance;
    let y_x_norm_answer = Math.sqrt(sentX.reduce((acc, bit, index) => {
        return acc + Math.pow(receivedY[index] - codeWord[index], 2);
    }, 0));

    let y_x_norm_answer_latex = `\\sqrt{${sentX.map((bit, index) => { return `(${receivedY[index]}-${codeWord})^2` }).join('+')}}`;

    console.log(N_0_first, noiseVariance, N_0_second, y_x, y_x_norm_answer);
    console.log(N_0_first == N_0_first_answer && N_0_second == N_0_second_answer && Math.abs(y_x_norm - y_x_norm_answer) <= errorEpsilon);
    if (N_0_first == N_0_first_answer && N_0_second == N_0_second_answer && Math.abs(y_x_norm - y_x_norm_answer) <= errorEpsilon) {
        likelihoodQuestionObservation.innerHTML = `<b>Acceptable answer! This exercise accepts the answer \\( \\displaystyle {p(\\boldsymbol{y}|\\boldsymbol{x})=\\frac{1}{\\sqrt{\\pi^4 ${N_0_first_answer}}}e^{\\dfrac{-a^2}{${N_0_second_answer}}}} \\) where \\(\\scriptsize{a = ${y_x_norm_answer_latex}}\\) and \\( a \\in [${(y_x_norm_answer - errorEpsilon).toFixed(2)}, ${(y_x_norm_answer + errorEpsilon).toFixed(2)}] \\)</b>`;
        likelihoodQuestionObservation.style.color = "green";
        likelihoodQuestionObservation.style.fontSize = "1vw";
        likelihoodQuestionObservation.style.display = "block";
        likelihoodQuestionObservation.style.textWrap = "balance";
        likelihoods[code] = y_x_norm_answer;

        MathJax.typeset();

    } else if (N_0_first != N_0_first_answer && N_0_second == N_0_second_answer && Math.abs(y_x_norm - y_x_norm_answer) <= errorEpsilon) {
        likelihoodQuestionObservation.innerHTML = "<b>Incorrect. Please check the noise variance.</b>";
        likelihoodQuestionObservation.style.color = "red";
    } else if (N_0_first == N_0_first_answer && N_0_second != N_0_second_answer && M) {
        likelihoodQuestionObservation.innerHTML = "<b>Incorrect. Please check the noise variance inside the exponent.</b>";
        likelihoodQuestionObservation.style.color = "red";
    } else if (N_0_first == N_0_first_answer && N_0_second == N_0_second_answer && Math.abs(y_x_norm - y_x_norm_answer) > errorEpsilon) {
        likelihoodQuestionObservation.innerHTML = "<b>Incorrect. Please check the numerator of the exponent.</b>";
        likelihoodQuestionObservation.style.color = "red";
    } else if (N_0_first == N_0_first_answer && N_0_second != N_0_second_answer && Math.abs(y_x_norm - y_x_norm_answer) > errorEpsilon) {
        likelihoodQuestionObservation.innerHTML = "<b>Incorrect. Please check the exponent.</b>";
        likelihoodQuestionObservation.style.color = "red";
    }
    else {
        likelihoodQuestionObservation.innerHTML = "<b>All the values are incorrect. Please try again.</b>";
        likelihoodQuestionObservation.style.color = "red";
    }

}

function verifyMaxLikelihood(code) {
    const likelihoodQuestionObservation = document.getElementById("likelihoodQuestionObservation");

    if (likelihoods[code] == Math.max(...Object.values(likelihoods)) && Object.keys(likelihoods).length == Object.keys(codewords).length) {
        document.getElementById("nextButton").style.display = "initial";
        likelihoodQuestionObservation.innerHTML = "Yes, the likelihoods are correct. The maximum likelihood is the correct codeword.";
        likelihoodQuestionObservation.style.color = "green";
        
        return true;
    } else if (Object.keys(likelihoods).length < Object.keys(codewords).length) {
        likelihoodQuestionObservation.innerHTML = "Please answer all the likelihood questions.";
        likelihoodQuestionObservation.style.color = "red";
    } else if (likelihoods[code] != Math.max(...Object.values(likelihoods))) {
        
        likelihoodQuestionObservation.innerHTML = "Check the likelihoods again. The maximum likelihood is incorrect.";
        likelihoodQuestionObservation.style.color = "red";
    }
    return false;
}

var MLErrorIndex; // index of the codeword for ML error question

function nextMLErrorQuestion() {

    MLErrorIndex = Math.floor(Math.random() * codewords.length);

    // randomRandomCodeword = selectRandomCodeword();
    // var probabilityFlip = Math.random();
    // noiseVariance = Math.floor(Math.random() * 5) + 1;

    // document.getElementById("noisevariance").innerHTML = noiseVariance;

    noise = parseFloat(gaussianRV(0, Math.sqrt(noiseVariance))().toFixed(2)); // clip to 2 decimal places
    sentX = codewords[MLErrorIndex].codeword;
    // var dim = randomGeneratorMatrix.dim;+

    // var codelength = randomGeneratorMatrix.matrix[0].length;

    document.getElementById("sentCodeword").innerHTML = "\\(\\boldsymbol{X}=\\)" + formatMatrix(sentX);


    const likelihoodQuestion = document.getElementById("likelihoodQuestion");
    const MLErrorQuestion = document.getElementById("MLErrorQuestion");
    const MLErrorQuestionObservation = document.getElementById("MLErrorQuestionObservation");
    const receivedVectors = document.getElementById("receivedVectors");

    likelihoodQuestion.style.display = "none";
    MLErrorQuestion.style.display = "block";

    document.getElementById("receivedCodeword").innerHTML = "";

    // // create options for the received codeword 
    // let options = Object.keys(receivedCodewords).map((key) => {
    //     return receivedCodewords[key];
    // }
    // );

    // // shuffle the options : https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    // options = options.map(value => ({ value, sort: Math.random() }))
    //     .sort((a, b) => a.sort - b.sort)
    //     .map(({ value }) => value)

    // // create a radio button for each option
    // let radioButtons = options.map((option, index) => {
    //     return `<input type="radio" id="receivedVector${index}" name="receivedVector" value="${index}" required><label for="receivedVector${index}">${formatMatrix(option)}</label><br>`;
    // });

    // receivedVectors.innerHTML = radioButtons.join("");

    console.log(receivedCodewords[MLErrorIndex]);

    options = receivedCodewords[MLErrorIndex].codewords;
    let checkboxes = options.map((option, index) => {
        return `<input type="checkbox" id="receivedVector${index}" name="receivedVector" value="${index}" required><label for="receivedVector${index}">${formatMatrix(option)}</label><br>`;
    });

    receivedVectors.innerHTML = checkboxes.join("");
    

    MathJax.typeset();

}

function checkMLErrorQuestion() {

    const MLErrorQuestion = document.getElementById("MLErrorQuestion");
    const MLErrorQuestionObservation = document.getElementById("MLErrorQuestionObservation");

    // selected options 
    let selectedOptions = Array.from(document.querySelectorAll('input[name="receivedVector"]:checked')).map((checkbox) => {
        return parseInt(checkbox.value);
    });

    let correctOptions = receivedCodewords[MLErrorIndex].mlError;
    console.log(selectedOptions, correctOptions);

    if (selectedOptions.length == correctOptions.length && selectedOptions.every((value, index) => value === correctOptions[index])) {
        MLErrorQuestionObservation.innerHTML = "<b>Great job! The selected codewords are correct.</b>";
        MLErrorQuestionObservation.style.color = "green";
        document.getElementById("nextButton").style.display = "initial";
    }
    else {
        MLErrorQuestionObservation.innerHTML = "<b>Incorrect. Please try again.</b>";
        MLErrorQuestionObservation.style.color = "red";
    }


}


// function checkMLQuestion() {
//     // const inputs = document.querySelectorAll('.mathContainer input');

//     const probabilityQuestion = document.getElementById("probabilityQuestion");
//     const probabilityQuestionObservation = document.getElementById("probabilityQuestionObservation");
//     const distQuestion = document.getElementById("distQuestion");


//     let N_0_first = parseFloat(document.querySelectorAll('.mathContainer #N_0_first')[0].value);
//     let N_0_second = parseFloat(document.querySelectorAll('.mathContainer #N_0_second')[0].value);
//     let y_x = Math.abs(document.querySelectorAll('.mathContainer #y_x')[0].value);

//     console.log(N_0_first, noiseVariance, N_0_second, y_x)

//     let y_x_norm_answer_latex = `\\sqrt{${sentX.map((bit, index) => { return `(${receivedY[index]}-${codeWord[index]})^2` }).join('+')}}`;

//     // let output = '';
//     // inputs.forEach(input => {
//     //     output += `Input ID: ${input.id}, Value: ${input.value}\n`;
//     // });

//     if (N_0_first / 2 == noiseVariance && N_0_second / 2 == noiseVariance && y_x == Math.abs(noise)) {
//         probabilityQuestionObservation.innerHTML = `<b>Great job! The correct answer is \\( \\displaystyle {p(y|x)=\\frac{1}{\\sqrt{\\pi ${2 * noiseVariance}}}e^{\\dfrac{-(${Math.abs(noise).toFixed(2)})^2}{${2 * noiseVariance}}}} \\) </b>`;
//         probabilityQuestionObservation.style.color = "green";
//         document.getElementById("nextButton").style.display = "initial";
//         // compile MathJax
//         MathJax.typeset();
//         // nextProbabilityQuestion()
//     }
//     else if ((N_0_first / 2 != noiseVariance || N_0_second / 2 != noiseVariance) && y_x == Math.abs(noise)) {
//         probabilityQuestionObservation.innerHTML = "<b>Incorrect. Please check the noise variance.</b>";
//         probabilityQuestionObservation.style.color = "red";
//     }
//     else if ((N_0_first / 2 == noiseVariance && N_0_second / 2 == noiseVariance) && y_x != Math.abs(noise)) {
//         probabilityQuestionObservation.innerHTML = "<b>Incorrect. Please check the exponent again.</b>";
//         probabilityQuestionObservation.style.color = "red";
//     }
//     else {
//         probabilityQuestionObservation.innerHTML = "<b>Incorrect. Please try again.</b>";
//         probabilityQuestionObservation.style.color = "red";
//     }

//     // probabilityQuestion.style.display = "none";
//     // distQuestion.style.display = "block";

//     // document.getElementById('probabilityQuestionObservation').innerText = output;
//     // console.log(output);
// }

function nextProbabilityQuestion() {
    const awgnTopQuestion = document.getElementById("awgnTopQuestion");

    const probabilityQuestion = document.getElementById("probabilityQuestion");
    const distQuestion = document.getElementById("distQuestion");
    const probabilityQuestionObservation = document.getElementById("probabilityQuestionObservation");


    probabilityQuestion.style.display = "none";
    distQuestion.style.display = "block";

    // change sentX and noise
    sentX = (Math.floor(Math.random() * 10 - 5));
    noiseVariance = (Math.floor(Math.random() * 5 + 1));

    awgnTopQuestion.innerHTML = "Consider a AWGN channel with noise variance \\(\\dfrac{N_0}{2}=" + ((noiseVariance).toFixed(2)) + "\\).";

    document.getElementById("sentCodeword").innerHTML = sentX.toString();
    document.getElementById("receivedCodeword").innerHTML = 'Y';

    document.getElementById("nextButton").style.display = "none";

    probabilityQuestionObservation.innerHTML = "";
    probabilityQuestionObservation.style.display = "none";

    // compile MathJax
    MathJax.typeset();

    randomiseGaussianOptions();
}

function nextDistQuestion() {

    const probabilityQuestion = document.getElementById("probabilityQuestion");
    const distQuestion = document.getElementById("distQuestion");
    const probabilityVectorQuestion = document.getElementById("probabilityVectorQuestion");

    const distQuestionObservation = document.getElementById("distQuestionObservation");

    probabilityQuestion.style.display = "none";
    distQuestion.style.display = "none";
    probabilityVectorQuestion.style.display = "block";

    // distQuestion.style.display = "none";
    // probabilityVectorQuestion.style.display = "block";

    sentX = randomRandomCodeword.codeword;
    document.getElementById("sentCodeword").innerHTML = "\\(\\boldsymbol{X}=\\)" + formatMatrix(sentX);

    // create a noise vector
    noise = [];

    for (let i = 0; i < sentX.length; i++) {
        noise.push(parseFloat(gaussianRV(0, Math.sqrt(noiseVariance))().toFixed(2)));
    }

    receivedY = sentX.map((bit, index) => {
        return (bit + noise[index]).toFixed(2);
    });

    document.getElementById("receivedCodeword").innerHTML = "\\(\\boldsymbol{Y}=\\)" + formatMatrix(receivedY);
    // compile MathJax
    MathJax.typeset();

    distQuestionObservation.innerHTML = "";
    distQuestionObservation.style.display = "none";

}



function checkProbabilityVectorQuestion() {
    const errorEpsilon = 0.1;
    const probabilityVectorQuestion = document.getElementById("probabilityVectorQuestion");
    const probabilityVectorQuestionObservation = document.getElementById("probabilityVectorQuestionObservation");
    const distQuestion = document.getElementById("distQuestion");

    let N_0_first = parseFloat(document.querySelectorAll('.mathContainer #N_0_first_vect')[0].value);
    let N_0_second = parseFloat(document.querySelectorAll('.mathContainer #N_0_second_vect')[0].value);
    let y_x_norm = parseFloat(document.querySelectorAll('.mathContainer #y_x_norm')[0].value);

    let N_0_first_answer = Math.pow(2 * noiseVariance, sentX.length);
    let N_0_second_answer = 2 * noiseVariance;
    let y_x_norm_answer = Math.sqrt(sentX.reduce((acc, bit, index) => {
        return acc + Math.pow(noise[index], 2);
    }, 0));

    let y_x_norm_answer_latex = `\\sqrt{${sentX.map((bit, index) => { return `(${receivedY[index]}-${sentX[index]})^2` }).join('+')}}`;

    // for y_x_norm, accept 0.1 difference

    if (N_0_first == N_0_first_answer && N_0_second == N_0_second_answer && Math.abs(y_x_norm - y_x_norm_answer) <= errorEpsilon) {
        probabilityVectorQuestionObservation.innerHTML = `<b>Acceptable answer! This exercise accepts the answer \\( \\displaystyle {p(\\boldsymbol{y}|\\boldsymbol{x})=\\frac{1}{\\sqrt{\\pi^4 ${N_0_first_answer}}}e^{\\dfrac{-a^2}{${N_0_second_answer}}}} \\) where \\(\\scriptsize{a = ${y_x_norm_answer_latex}}\\) and \\( a \\in [${(y_x_norm_answer - errorEpsilon).toFixed(2)}, ${(y_x_norm_answer + errorEpsilon).toFixed(2)}] \\)</b>`;
        probabilityVectorQuestionObservation.style.color = "green";
        probabilityVectorQuestionObservation.style.fontSize = "1vw";
        probabilityVectorQuestionObservation.style.display = "block";
        probabilityVectorQuestionObservation.style.textWrap = "balance";
        MathJax.typeset();

    } else if (N_0_first != N_0_first_answer && N_0_second == N_0_second_answer && Math.abs(y_x_norm - y_x_norm_answer) <= errorEpsilon) {
        probabilityVectorQuestionObservation.innerHTML = "<b>Incorrect. Please check the noise variance.</b>";
        probabilityVectorQuestionObservation.style.color = "red";
    } else if (N_0_first == N_0_first_answer && N_0_second != N_0_second_answer && Math.abs(y_x_norm - y_x_norm_answer) <= errorEpsilon) {
        probabilityVectorQuestionObservation.innerHTML = "<b>Incorrect. Please check the noise variance inside the exponent.</b>";
        probabilityVectorQuestionObservation.style.color = "red";
    } else if (N_0_first == N_0_first_answer && N_0_second == N_0_second_answer && Math.abs(y_x_norm - y_x_norm_answer) > errorEpsilon) {
        probabilityVectorQuestionObservation.innerHTML = "<b>Incorrect. Please check the numerator of the exponent.</b>";
        probabilityVectorQuestionObservation.style.color = "red";
    } else {
        probabilityVectorQuestionObservation.innerHTML = "<b>All the values are incorrect. Please try again.</b>";
        probabilityVectorQuestionObservation.style.color = "red";
    }

    // compile MathJax
    MathJax.typeset();


}


// function BinaryErasureChannel() {
// replace random codeword with erasure with probability probabilityFlip
const receivedCodeword = randomRandomCodeword.codeword.map((bit) => {
    if (Math.random() < probabilityFlip) {
        return "\\epsilon";
    }
    return bit;
}
);


function formatMatrix(matrix) {
    return "\\(\\begin{bmatrix} " + matrix + " \\end{bmatrix}\\)";
}

function reset() {
    const dimensionEntered = document.getElementById("dimensionEntered");
    dimensionEntered.innerHTML = "";

    initial();
}

function initial() {

    randomGeneratorMatrix = selectRandomGeneratorMatrix();
    dim = randomGeneratorMatrix.dim;
    codelength = randomGeneratorMatrix.matrix[0].length;

    const generatorMatrixElement = document.getElementById("generatorMatrix");
    generatorMatrixElement.innerHTML = " \\(A \\)= " + formatMatrix(randomGeneratorMatrix.matrix);

    // Trigger MathJax to typeset the updated content
    MathJax.typeset([generatorMatrixElement]);

    const isGeneratorQuestion = document.getElementById("isGeneratorQuestion");
    const rateQuestion = document.getElementById("rateQuestion");
    const generatorForm = document.getElementById("generatorForm");
    const rateForm = document.getElementById("rateForm");

    const rateEntered = document.getElementById("rateEntered");

    // dimensionEntered.innerHTML = "Try with new matrix";
    rateEntered.innerHTML = "";

    isGeneratorQuestion.style.display = "block";
    rateQuestion.style.display = "none";

    generatorForm.reset();
    rateForm.reset();
}
