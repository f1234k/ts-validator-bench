# Typescript Validation Library Benchmark

## Introduction & Background

This repo was created at the request of an [X post](https://x.com/FabianHiller/status/1942231856176595402) which was a response to a [previous post](https://x.com/NeoterismoiTaki/status/1942191026887688248). Here is the original post:

> I benchmarked @arktypeio, @valibot and @colinhacks against each other for my use-case using @bunjavascript.
> 
> What is my use-case?
> - Validating ~500 messages per second from a Mosquitto (MQTT) server.
> - The schema of the messages is pretty simple (max 3 levels of nesting).
> - Everything is executed on the server.
> 
> How did I build the benchmark?
> - I had no previous experience with any of the libraries.
> - I went through the documentation of each library and converted my types to their types.
> - Then I funneled all the messages for validation.
> 
> Who won?
> Everybody won. But mostly @arktypeio and @valibot. ~I didn't like the fact that zod uses way more memory than the others.~(1)
> 
> Notes, key takeaways & thoughts
> - It took me a bit longer to make @arktypeio work. I don't know why, but their syntax seemed a bit more foreign to me. That being said, I didn't spend any time trying to dive deeply into their tooling.
> - I used to avoid doing runtime validations because I thought that it will be a huge performance hit (especially with hundreds, scaling up to thousands of messages per second). Apparently I was wrong.
> - I have no idea if @bunjavascript is to "blame" for the stellar performance by all contenders, but ~ if there is enough interest, I might test it with nodejs.~(2)
> - As I understand it, @arktypeio is specifically designed to handle more complex objects and my benchmark might not be a good indication of the gains that you'll get in more complex scenarios.
> - On the other hand, @valibot values small library size which should make it ideal for the frontend. I will be putting their claims to the test on my next benchmark.
> - The main takeaway is this: you should (almost) always do runtime validation on the server.

Notes:
(1) Apparently, Zod was being taxed for the initial memory loaded by the script. It still uses more memory than the rest, but not by that much.
(2) There is now a tsx/nodejs benchmark.

## Future Plans

Since the MQTT server that broadcasts the messages is private, it's not possible for people to run the benchmark by themselves. However, if/when new validation libraries are added, I will be running them against the MQTT server and posting the results here.

The one thing that was made clear to me was that, even though at first glance my scenario seems to be a daunting one for runtime validation, all libraries seem to handle it with ease and no major performance hits.

In the future, the amount of messages that are broadcasted by the MQTT server will increase as more devices are connected to the network, but I don't expect any major changes in the results.

However, the next thing that I want to benchmark is the performance of the validation libraries when they are used on the client side. I am already processing a large number of messages via Bun's WebSocket API and I would like to put all the libraries to the test.

## Contribute

You can contribute to this project in a number of ways:

1. Add your validation library. The initial benchmark can be considered a baseline for a real-life scenario where your library can easily process the messages that are broadcasted by the MQTT server.
2. If you have any ideas about how to improve the benchmark, you can open an issue. Since this benchmark was put together rather hastily in an effort to evaluate the options for my own use-case, I am open to suggestions on how to improve it. This includes (but is not limited to) things like: better metrics, better measurement methods etc.
3. You can always reach me via the [issue queue](https://github.com/f1234k/ts-validator-bench/issues) or my [X Account](https://x.com/NeoterismoiTaki).

## Key Contributors
- [@fabian-hiller](https://github.com/fabian-hiller): Asked for this repo to be created.
- [@Kosai106](https://github.com/Kosai106): Cleaned up the code, added validathor and made the benchmark more extensible.
- [@DZakh](https://github.com/DZakh): Added Sury to the benchmark. Many good suggestions for improvements.

## Results

### Benchmark Results for tsx v4.20.3 node v22.14.0 :

| Library        | Msg Processed | Msgs/Second | CPU User (ms)   | CPU System (ms) | Memory (MB) | Validation Errors |
|----------------|---------------|-------------|-----------------|-----------------|-------------|-------------------|
| Unvalidated    | 30096         | 501.41      | 1141.13         | 357.53          | 5.47        | 0                 |
| Zod            | 29538         | 492.29      | 1665.78         | 402.89          | 3.28        | 91                |
| Valibot        | 29446         | 490.75      | 1226.20         | 272.13          | -1.75       | 93                |
| ArkType        | 29502         | 491.69      | 643.09          | 285.20          | 0.69        | 85                |
| Validathor     | 29643         | 494.00      | 15068.72        | 363.74          | 1.42        | 93                |
| Sury           | 29499         | 491.63      | 569.15          | 299.77          | -0.78       | 81                |

### Benchmark Results for Bun v.1.2.19 :

| Library        | Msg Processed | Msgs/Second | CPU User (ms)   | CPU System (ms) | Memory (MB) | Validation Errors |
|----------------|---------------|-------------|-----------------|-----------------|-------------|-------------------|
| Unvalidated    | 30058         | 500.68      | 9506.87         | 1999.96         | 31.60       | 0                 |
| Zod            | 29597         | 493.20      | 10538.08        | 2194.07         | 1.99        | 80                |
| Valibot        | 29651         | 494.15      | 10371.35        | 2218.99         | 0.09        | 89                |
| ArkType        | 29588         | 493.10      | 9979.19         | 2160.38         | -0.08       | 83                |
| Validathor     | 29716         | 495.23      | 11856.03        | 2332.33         | -0.23       | 80                |
| Sury           | 29569         | 492.78      | 10295.69        | 1928.67         | 0.59        | 81                |

![Benchmark Results](img/mqtt_test_1.png)

### Notes

1. Don't pay too much atttention to the exact amount of messages or validation errors. Since this is
  a real-life scenario, the number of messages that are broadcasted by the MQTT server can vary in a
  1-minute window. Same goes for Validation errors. If you see a library having processed around 500
  messages, it means that it has handled all messages with ease.
2. The RAM usage may be negative. This practically means that when the specific library's run
  started, there was some memory being used from the previous library's run that got garbage 
  collected.