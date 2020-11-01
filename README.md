# Martian Robots

## How to build
```
docker build -t calbertts/martian-robots:v1 .
```

## How to run as CLI tool



### With a file input
```
docker run -i --rm calbertts/martian-robots:v1 < inputFile 
```

### With a file input in a pipeline
```
cat inputFile | docker run -i --rm calbertts/martian-robots:v1
```

### Interactive input
```
docker run -i --rm calbertts/martian-robots:v1
```

### Example
```
# clone this repo and run
docker run -i --rm calbertts/martian-robots:v1 < src/interfaces/cliExample

# with details
docker run -i --rm -e DETAILED="true" calbertts/martian-robots:v1 < src/interfaces/cliExample
```
