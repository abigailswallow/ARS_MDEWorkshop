/* defining variables for the width and heigth of the SVG */
const width = document.querySelector("#chart").clientWidth;
const height = document.querySelector("#chart").clientHeight;
const margin = { top: 50, left: 150, right: 50, bottom: 150 };

/*creating the actual SVG */
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.csv("./data/US_Textile_Fiber_Trade.csv", parse).then(function (data) {


    /* filter subset of data, grabbing only the rows where the country = China */
    const filtered_data = data.filter(d => d.fiber_type === "raw_cotton" && d.year === 2020);

    // console.log(filtered_data)
    let nest = d3.nest()
    .key(function(d){
        return d.import_export;
    })
	  .key(function(d){
	    return d.month;
	  })
      .rollup(d => d3.sum(d, g => g.value))
	  
	  .entries(filtered_data)

      nest.forEach((d) => {
        d.values.forEach(p => p.key = +p.key)
      })  

      console.log(nest)


 
   //scales - xScale is a linear scale of the years
    const xScale = d3.scaleLinear()
        // .domain([d3.min(nest, d => d.key), d3.max(nest, d => d.key)])
        .domain([1,12])
        .range([margin.left, width - margin.right]);

    //yScale is a linear scale with a minimum value of 0 and a maximum bsed on the population maximum
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(nest[0].values, d => d.value)])
        .range([height - margin.bottom, margin.top]);

    //set up the x and y values of your line
    const line = d3.line()
        .x(d => xScale(d.key))
        .y(d => yScale(d.value))

    //draw the path
    const pathImport = svg.append("path")
        .datum(nest[0].values)
        .attr("d", d => line(d))
        .attr("stroke", "red")
        .attr("fill", "none")
        .attr("stroke-width", 2);

        const pathExport = svg.append("path")
        .datum(nest[1].values)
        .attr("d", d => line(d))
        .attr("stroke", "red")
        .attr("fill", "none")
        .attr("stroke-width", 2);

    const xAxis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom().scale(xScale).tickFormat(d3.format("Y")));

    const yAxis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft()
            .scale(yScale)
            .tickFormat(d3.format(".2s"))); //use d3.format to customize your axis tick format


    const xAxisLabel = svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", width / 2)
        .attr("y", height - margin.bottom / 2)
        .text("Year");

    const yAxisLabel = svg.append("text")
        .attr("class", "axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", margin.left / 2)
        .text("GDP Per Capita");

});

//get the data in the right format
function parse(d) {
    return {
        fiber_type: d.fiber_type, //cotton, silk, wool, etc.
        import_export: d.import_export, //this is a binary value
        category: d.category, //yarn, apparel, home, etc.
        sub_category: d.sub_category, //type of yarn, type of home
        year: +d.year, //we want this as a number
        month: +d.month, //we want this as a number
        value: +d.value //we want this as a number
    }
}

