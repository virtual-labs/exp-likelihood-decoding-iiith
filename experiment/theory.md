# Theory

As described in the theory of the previous experiment, a memoryless channel is described by the input alphabet $\cal X$ (set of possible values taken by the input random variable $X$), the output alphabet $\cal Y$ (possible values taken by the output random variable $Y$), and the transition probabilities $p_{Y|X}(y|x), \forall x\in{\cal X}, y\in{\cal Y}$. 

Consider that we use the channel $n$ times, i.e, our input sequence is a vector $\bm{x}=(x_1,\ldots,x_n)\in {\cal X}^n$ (recall that ${\cal X}^n$ denotes the set of all $n$-length tuples with entries from ${\cal X}$). Because of the noisy characteristics of the channel (governed by the transition probabilities $p_{Y|X}$), the transmitted input vector $\bm{x}$ is transformed, into a random output vector $\bm{Y}=(Y_1,\ldots,Y_n)$, governed by the transition probabilites $p_{\bm{Y}|\bm{X}}(\bm{y}|\bm{x})=\prod_{i=1}^np(y_i|x_i)$. 

The receiver observes the output sequence $\bm{Y}=\bm{y}$. The goal of the receiver is then to decode the transmitted vector $\bm{x}$. The estimate of the transmitted vector is denoted by $\hat{\bm{x}}$. However, because of the fact that the channel noise is random, there could be several possible vectors in ${\cal X}^n$ which result in the same received vector $\bm{y}$. Therefore, the decoder at the receiver has to have some *metric*, based on which it can decide the value for the estimate  $\hat{\bm{x}}$. 

Specifically, we consider the *likelihood* as the decoding metric, in this virtual lab. That is, the decoder seeks to find that $\bm{x}$ which maximizes the probability $p(\bm{y}|\bm{x})$. 
$$\hat{\bm{x}}=arg\max p(\bm{y}|\bm{x}).$$ 
The probability $p(\bm{y}|\bm{x})$ is called the **likelihood of $\bm{x}$ with respect to the received vector $\bm{y}$.**

However, the problem that there could be several candidates for such $\bm{x}\in{\cal X}^n$ which maximize the likelihood. This problem can be resolved by choosing the transmit sequences from a code. Specifically, we are interested in choosing $n$-length linear codes for binary input channels. 

## Using Linear Codes on Memoryless Binary-Input Channels

As defined before, an $n$-length linear code $\cal C$ over $\mathbb{F}_2$ of rate $\frac{k}{n}$ is a $k$-dimensional subspace of $\mathbb{F}_2^n$. 

---

***The ML Decoding Rule for Linear Codes***

Assuming that the receiver receives the vector $\bm{y}$, the Maximum Likelihood decoding rule (called the **ML decoding rule**) when using such a code on a binary-input channel, is written as follows. 

$$\hat{\bm{x}}=arg_{\bm{x}\in{\cal C}}\max p(\bm{y}|\bm{x}).$$ 

In case of there being multiple codewords in $\cal C$ which maximize the likelihood, we will assume that the decoder will *break the ties arbitrarily*, i.e., the decoder declares any of these codewords (that maximize the likelihood) as the estimate. 

---

The figure shows a depiction of using a linear code with such a decoder. 

---

**NOTE**

Add generic decoder picture when using a linear code $\cal C$. Ask me how the pic should look. 

---

We now explore via an example how the ML decoding works for linear codes on the three channel models we consider in this work. Throughout the three channels, we consider the code ${\cal C}$ which is the rowspace of the matrix 
$$G=
\begin{pmatrix}
1&0&1&0&1\\
0&1&0&1&1
\end{pmatrix}.$$
This code $\cal C$ contains $4$ codewords, which are all the $\mathbb{F}_2$-linear-combinations of the two rows of $G$. Thus we have,

$${\cal C}=\{\bm{x}_1=(0,0,0,0,0),\bm{x}_2=(1,0,1,0,1), \bm{x}_3=(0,1,0,1,1), \bm{x}_4=(1,1,1,1,0)\}.$$ 

We now see how the ML decoder decodes, when the codeword $\bm{x}_1=(0,0,0,0,0)$ is transmitted, in each of the three channels we consider in this virtual lab. 

#### 1. Binary Erasure Channel $BEC(\epsilon)$: 

Assume that the received vector $\bm{y}=(?,0,?,0,0)$. In this case, we see that $p(\bm{y}|\bm{x}_i)=0, \forall i=2,3,4$ as $\bm{x}_i$ and $\bm{y}$ are not compatible vectors, for any $i=2,3,4$. At the same time, we have $p(\bm{y}|\bm{x}_1)=\epsilon^2(1-\epsilon)^3$. Since $\epsilon\in(0,1)$, clearly, we see that $p(\bm{y}|\bm{x}_1)>p(\bm{y}|\bm{x}_i), \forall i=2,3,4.$ Thus, the ML decoder outputs the estimate $\hat{\bm{x}}$ as the codeword $\bm{x}_1=(0,0,0,0,0)$. Thus, the ML decoder decodes the transmitted codeword correctly. 

It is easy to present a scenario when the decoding can be incorrect. Consider the received vector with three erasures, $\bm{y}=(?,0,?,0,?)$. In this case, we see that $p(\bm{y}|\bm{x}_1)=p(\bm{y}|\bm{x}_2)=\epsilon^3(1-\epsilon)^2$, while  $p(\bm{y}|\bm{x}_i)=0, \forall i=3,4$. Therefore, in this case, the decoder can declare one of $\bm{x}_1$ or $\bm{x}_2$ as the estimate. In case the decoder chooses $\bm{x}_2$, clearly the decoder will be making a decoding error. 

### 2. Binary Symmetric Channel $BSC(p)$: 

Assume that the received vector $\bm{y}=(1,0,0,0,0)$. 

### 3. AWGN Channel with Noise ${\cal N}(0,N_0/2)$: 