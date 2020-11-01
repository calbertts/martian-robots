# Martian Robots

## How to build the container
```
docker build -t calbertts/martian-robots:v1 .
```

## How to run as CLI tool

### Interactive input
```
docker run --rm -it calbertts/martian-robots:v1
```

### With a file input
```
echo "5 3
1 1 E
RFRFRFRF
3 2 N
FRRFLLFFRRFLL
0 3 W
LLFFFLFLFL" > inputFile

docker run -i --rm calbertts/martian-robots:v1 < inputFile 

# Show more execution details
docker run -i --rm -e DETAILED="true" calbertts/martian-robots:v1 < inputFile 
```

### With a file input in a pipeline
```
cat inputFile | docker run -i --rm calbertts/martian-robots:v1
```

