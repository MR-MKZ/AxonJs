# Axon Benchmarks

## Our test result

- [AxonJs test result](./axon_result.log)
- [Express test result](./express_result.log)

## Installation

You will need to install [wrk](https://github.com/wg/wrk/blob/master/INSTALL) in order to run the benchmarks.

also you can install wkr by command `sudo apt install wrk` in ubuntu.

## Running

To run the benchmarks, first install the dependencies `npm i`, then run `make`

The output will look something like this:

```
  50 connections
  1 middleware
 3.59ms
 17719.68

 [...redacted...]

  1000 connections
  10 middleware
 42.79ms
 16146.45

```

### Tip: Include Node.js version in output

You can use `make && node -v` to include the node.js version in the output.

### Tip: Save the results to a file

You can use `make > results.log` to save the results to a file `results.log`.
