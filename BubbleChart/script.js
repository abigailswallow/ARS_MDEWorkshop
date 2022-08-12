//Setting up the SVG where we'll be appending everything for our chart
const width = document.querySelector("#chart").clientWidth;
const height = document.querySelector("#chart").clientHeight;
const margin = { top: 0, left: 0, right: 0, bottom: 0 };


const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.csv("./data/US_Textile_Fiber_Trade.csv", parse).then(function (data) {

    // Goal: Display 100 bubbles of data, each representing 1%. The question: what is the proportion of each fiber_type within apparel? 


    /* filter subset of data, getting only imported, apparel entries in 2020*/
    const filtered = data.filter(d => d.import_export === "import" && d.category === "apparel" && d.year === 2020);


    // nest by fiber type and rollup to sum it up, end up with 5 keys
    let nest = d3.nest()
        .key(d => d.fiber_type)
        .rollup(d => d3.sum(d, g => g.value))
        // .rollup()
        .entries(filtered)

    console.log(filtered)
    let total = 0;

    // calculate the sum of the fiber_type values
    for (let i = 0; i < nest.length; i++) {
        total = total + nest[i].value;
    }

    // add the property of percent to each fiber_type
    nest.forEach((d) => {
        d.percent = Math.round(d.value / total * 100)
    })
    console.log(total)
    console.log(nest)

    nest.sort((a, b) => b.percent - a.percent)

    let data1 = []
    for (let i = 0; i < nest.length; i++) {
        for (let j = 0; j < nest[i].percent; j++) {
            data1.push({
                fiber_type: nest[i].key,
            })
        }
    }

    console.log(data1)

    const gridHeight = 10;

    let gridData = [];
    for (let i = 0; i < gridHeight; i++) {
        for (let j = i; j < data1.length; j += gridHeight) {
            gridData.push({
                id: data1[j].fiber_type,
                y: i,
                // color: gridData[j].colorScale
            })
        }
    }
    console.log(gridData)

    let nestedGridData = d3.nest()
        .key(d => d.y)
        .rollup()
        .entries(gridData)

    nestedGridData.forEach((d) => {
        d.key = +d.key;
        for (let i = 0; i < d.values.length; i++) {
            d.values[i].x = i;
        }
    })
    console.log(nestedGridData)

    // create color scale
    const colorScale = d3.scaleOrdinal().domain(nestedGridData)
        .range(["#23171b", "#3987f9", "#2ee5ae", "#95fb51", "#feb927", "#e54813"]);



    let yScale = d3.scaleBand()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        // .domain(d3.map(nestedGridData, d => d.key))
        .range([margin.top, height - margin.bottom])
        .padding(0.1)

    let xScale = d3.scaleBand()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        // .domain(d3.map(nestedGridData[0].values, d => d.x))
        .range([margin.left, width - margin.right])
        .padding(0.1)



    let grouping = svg.selectAll(".barGroup").data(nestedGridData)

    grouping
        .enter()
        .append("g")
        .attr("class", "barGroup")
        .merge(grouping)

        .attr("transform", (d) => `translate(0, ${(yScale(d.key))})`)

    grouping.exit()
        .remove();

    let circles = d3.selectAll(".barGroup").selectAll("rect").data(d => d.values)

    circles.enter()
        .append("rect")
        .attr("x", function (p) { return xScale(p.x); })
        // .attr("width", 10)
        // .attr("height", 10)
        .attr("opacity", 0)
        .merge(circles)

        .transition()
        .duration(500)
        .delay(function (p, i) { return 10 * i; })
        .attr("x", function (p) { return xScale(p.x); })
        .attr("width", function (p) { return xScale.bandwidth() })
        .attr("height", function (p) { return yScale.bandwidth() })
        // .attr("width", 10)
        // .attr("height", 10)
        .attr("opacity", 1)
        .attr("fill", p => colorScale(p.id))
        .attr("rx", 100)
        .attr("ry", 100)


    // .attr("data-legend",function(d) { return d.key)

    circles.exit()
        .transition()
        .remove();



    // legend
    // select the svg area
    let svg1 = d3.select("#legend")

    // Handmade legend
    svg1.append("circle").attr("cx", 200).attr("cy", 80).attr("r", 8).style("fill", "#fff")
    svg1.append("circle").attr("cx", 200).attr("cy", 130).attr("r", 8).style("fill", "#3987f9")
    svg1.append("circle").attr("cx", 200).attr("cy", 160).attr("r", 8).style("fill", "#2ee5ae")
    svg1.append("circle").attr("cx", 200).attr("cy", 190).attr("r", 8).style("fill", "#95fb51")
    svg1.append("circle").attr("cx", 200).attr("cy", 220).attr("r", 8).style("fill", "#feb927")
    svg1.append("circle").attr("cx", 200).attr("cy", 250).attr("r", 8).style("fill", "#e54813")
    svg1.append("text").attr("x", 220).attr("y", 80).text("1 Circle = 1% of Apparel Imports by Value in 2020").style("fill", "#fff").style("font-size", "18px").style("text-decoration", "underline").style("font-weight", "600").attr("alignment-baseline", "middle")
    svg1.append("text").attr("x", 220).attr("y", 130).text("Cotton").style("font-size", "18px").style("fill", "#fff").attr("alignment-baseline", "middle")
    svg1.append("text").attr("x", 220).attr("y", 160).text("Synthetic").style("font-size", "18px").style("fill", "#fff").attr("alignment-baseline", "middle")
    svg1.append("text").attr("x", 220).attr("y", 190).text("Wool").style("font-size", "18px").style("fill", "#fff").attr("alignment-baseline", "middle")
    svg1.append("text").attr("x", 220).attr("y", 220).text("Linen").style("font-size", "18px").style("fill", "#fff").attr("alignment-baseline", "middle")
    svg1.append("text").attr("x", 220).attr("y", 250).text("Silk").style("font-size", "18px").style("fill", "#fff").attr("alignment-baseline", "middle")
    
});

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

