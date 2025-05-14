const width = window.innerWidth;
const height = window.innerHeight;

//define measurements
let teamMargin = {top: 10, right: 250, bottom: 30, left: 60},
    teamWidth = width - teamMargin.left - teamMargin.right,
    teamHeight = height-500 - teamMargin.top - teamMargin.bottom;
let teamTop = height - teamHeight -100;
let teamLeft = teamMargin.left;
// plots
d3.csv("data/pokemon_alopez247.csv").then(rawData =>{
    console.log("rawData", rawData);


    //parses the number of pokemon per type
    const typeCounter = {};
    rawData.forEach(d=>{
        const type1 = d.Type_1;
        const type2 = d.Type_2;

        if (type1){
            typeCounter[type1] = (typeCounter[type1] || 0)+1;
        }
        if (type2){
            typeCounter[type2] =(typeCounter[type2] || 0)+1;
        }

    });

    const typeData = Object.entries(typeCounter).map(([type, count]) => ({type, count}));
    console.log("typeData", typeData);

    //parses the number of pokemon per generation
    const generationCount = {};
    rawData.forEach(d=>{
        const gen = d.Generation;

        if (gen){
            generationCount[gen] = (generationCount[gen] || 0)+1;
        }

    });
    const genData = Object.entries(generationCount).map(([generate, count1]) => ({generate, count1}));
    console.log("typeData", typeData);

    //Parse the averages for hp, attack, defense, speed
    const statsCount = {};

    rawData.forEach(d=>{
        const gen = d.Generation;

        if (!statsCount[gen]){
            statsCount[gen] = {
                count: 0, hp: 0, attack: 0, defense: 0, special_attack: 0, special_defense: 0, speed: 0
            };
        }
        statsCount[gen].count +=1
        statsCount[gen].hp += +d.HP;
        statsCount[gen].attack += +d.Attack;
        statsCount[gen].defense += +d.Defense;
        statsCount[gen].special_attack += +d.Sp_Atk;
        statsCount[gen].special_defense += +d.Sp_Def;
        statsCount[gen].speed += +d.Speed;
    });

    //combines the averages into a parallel data to be used for plot
    const parallelData = Object.entries(statsCount).map(([gen, stat])=>
    ({
        generation: gen, hp: stat.hp / stat.count,
        attack: stat.attack/stat.count, defense: stat.defense/stat.count,
        special_attack: stat.special_attack/stat.count, special_defense: stat.special_defense/stat.count,
        speed: stat.speed/stat.count


    }));

    console.log("parallelData", parallelData);

    // Plot 1: Bar Graph

    //selects the svg element
    const svg = d3.select("svg");

    //appends g to svg that has the measurements
    const g1 = svg.append("g")
        .attr("width", teamWidth + teamMargin.left + teamMargin.right) //sets width
        .attr("height", teamHeight + teamMargin.top + teamMargin.bottom) //sets height
        .attr("transform", `translate(${teamLeft}, ${teamTop})`); //moves the g in the svg

    //maps colors to types
    const colorTypes = {
        "Grass":"green","Poison":"purple",
        "Fire":"red", "Flying": "lightblue",
        "Water": "blue", "Bug": "lightgreen",
        "Normal": "gray", "Electric": "yellow",
        "Ground": "brown", "Fairy":"pink",
        "Fighting": "orange", "Psychic": "magenta",
        "Rock": "maroon", "Steel": "darkgrey",
        "Ice": "darkblue", "Ghost": "lavender",
        "Dragon": "gold", "Dark":"black" 
    };
    // X label
    g1.append("text")
        .attr("x", teamWidth / 2) //centers on x axis
        .attr("y", teamHeight + 50) // position under the x axis
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Pokemon Type");
    
    
    // Y label
    g1.append("text")
        .attr("x", -(teamHeight / 2)) //centers vertically
        .attr("y", -40) //postions to the left of the y axis
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)") //rotate the text
        .text("Number of Pokemon");

    //graph title
    g1.append("text")
        .attr("x", teamWidth / 2) //centers title
        .attr("y", -30) //moves the title above the graph
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Number of Pokemon Per Type");

     // X ticks
    const x2 = d3.scaleBand() //scales the x axis
        .domain(typeData.map(d => d.type)) //sets the domain for all types
        .range([0, teamWidth]) //sets the range as the width
        .paddingInner(0.3) //spaces
        .paddingOuter(0.2); //spaces

    //creates the bottom axis
    const xAxisCall2 = d3.axisBottom(x2);

    //appends the x axis
    g1.append("g")
        .attr("transform", `translate(0, ${teamHeight})`) //moves the axis under the chart
        .call(xAxisCall2) //calls the axis creation
        .selectAll("text") 
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");

    // Y ticks
    const y2 = d3.scaleLinear() //scales the y axis
        .domain([0, d3.max(typeData, d => d.count)]) //domain from 0 to the max of typeData
        .range([teamHeight, 0]) //sets range
        .nice(); //rounds domain

    //creates the left axis with 6 ticks
    const yAxisCall2 = d3.axisLeft(y2).ticks(6);

    //appends the y axis to the graph
    g1.append("g").call(yAxisCall2);

        //creates the bars
    g1.selectAll("rect").data(typeData) 
        .enter().append("rect") //adds a rect for each type
        .attr("y", d => y2(d.count)) //defines vertical position
        .attr("x", d => x2(d.type)) //defines horizontal position
        .attr("width", x2.bandwidth()) //defines height
        .attr("height", d => teamHeight - y2(d.count)) //defines width
        .attr("fill", d => colorTypes[d.type]); //fills bars with color
    //creates the legend using the svg append
    const legend = svg.append("g")
        .attr("transform", `translate(${teamWidth + teamMargin.left + 20}, ${teamTop})`);

    const legendHeight = 22;
    const legendWidth = 100;
    const types = Object.keys(colorTypes);

    //creates the colored squares for the legend
    legend.selectAll("rect")
        .data(types)
        .enter().append("rect")
        .attr("x", (_, i)=> (i%2)*legendWidth) //divides boxes into two columns
        .attr("y", (_, i) => Math.floor(i/2)*legendHeight) // stacks rows
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colorTypes[d]); //fills boxes with colors

    //appends the type names next to boxes
    legend.selectAll("text")
        .data(types)
        .enter().append("text")
        .attr("x", (d, i) => (i % 2) * legendWidth + 25) //moves text to right of boxes
        .attr("y", (_, i) => Math.floor(i / 2) * legendHeight + 14) //align with the boxes
        .attr("font-size", "14px")
        .attr("text-anchor", "start")
        .text(d => d);

    //Plot 2 Pie Chart

    const radius = 150;
    
    //appends the g for the chart
    const generatePie = svg.append("g")
        .attr("transform", `translate(200, 200)`); //positions the pie chart at this location

    //adds random colors per generation
    const pieColor = d3.scaleOrdinal()
        .domain(genData.map(d => d.generate))
        .range(d3.schemeCategory10); 
    //generates the pie chart
    const pie = d3.pie().value(d=>d.count1);

    //generates the arcs for the slices
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    //creates a group per slice
    const slices = generatePie.selectAll(".arc")
        .data(pie(genData)) //gets the generation data for slices
        .enter()
        .append("g")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("class", "arc");

    //appends the path for slices
    slices.append("path")
        .attr("d", arc) //creates the arc path
        .attr("fill", d=>pieColor(d.data.generate)); //fills slices with colors

    //calculates the total to create the percentages
    const total = d3.sum(genData, d => d.count1);

    // adds the percentages to each slice
    slices.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`) //places the label in the center
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .text(d => {
            const percent = (d.data.count1 / total) * 100; //calculates percent
            return percent ?`${percent.toFixed(1)}%` : "";  //return the percentage
        });

    //adds the title to the top of chart
    generatePie.append("text")
        .attr("x", 0) //centers
        .attr("y", -160) //places above the pie chart
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text("Number of Pokemon Per Generation");

    //creates the g for the pie chart
    const pieLegend = svg.append("g")
        .attr("transform", "translate(400, 100)"); //positions it at this location

    const pieLegendHeight = 20;

    //creates boxes with colors for legend
    pieLegend.selectAll("rect")
        .data(genData) //gets genData
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (_, i) => i * pieLegendHeight) //stacks boxes vertically
        .attr("width", 15) //defines width
        .attr("height", 15) //defines height
        .attr("fill", d => pieColor(d.generate)); //fills the color
    
    // moves text next to each box for legend
    pieLegend.selectAll("text")
        .data(genData)
        .enter()
        .append("text")
        .attr("x", 25) //offsets text
        .attr("y", (_, i) => i * pieLegendHeight + 12) //moves text next to boxes
        .attr("font-size", "14px")
        .text(d => `Gen ${d.generate}`); //generates the labels and applies them

    //Plot 3: Parallel Coordinates Plot
    
    //define variables and the measurements
    const variables = ["hp", "attack", "defense", "special_attack", "special_defense", "speed"];
    const pMargin = {top: 40, right: 40, bottom: 10, left: 40};
    const pWidth = 600 - pMargin.left - pMargin.right;
    const pHeight = 300 - pMargin.top - pMargin.bottom;
    
    //generates random colors for each generation
    const parColor = d3.scaleOrdinal()
        .domain(parallelData.map(d => d.generate)) //maps the generations
        .range(d3.schemeCategory10); //range for assigning colors
    
    //y scale for each variable
    const yScale = {};
    variables.forEach(v => {
        yScale[v] = d3.scaleLinear()
            .domain([
                d3.min(parallelData, d=> d[v]), //domain from minimum of data to max
                d3.max(parallelData, d=> d[v])
            ])
            .range([pHeight, 0]); //range from height to 0
    });

    //x scale for the variables
    const xScale = d3.scalePoint()
        .domain(variables) //domain is variables
        .range([0, pWidth]); //range from 0 to width

    //generates lines for each variable
    const genLines = d3.line()
        .x(d=> xScale(d.variable)) //sets x position
        .y(d=> yScale[d.variable](d.value)); //sets y position

    //appends g to parallelGroup
    const parallelGroup = svg.append("g")
        .attr("transform", "translate(800, 80)"); //places graph at this location

    //generate the lines for each generation
    parallelData.forEach(d=>{
        const point = variables.map(v=>({
            variable: v, value: d[v] //sets each variable with v(value)
        }));
        parallelGroup.append("path") //appends path
            .datum(point)
            .attr("fill", "none")
            .attr("stroke", d3.schemeCategory10[d.generation % 10])
            .attr("stroke-width", 2)
            .attr("d", genLines);
    });

    //create the axes for each variable
    variables.forEach(v =>{
        parallelGroup.append("g")
            .attr("transform", `translate(${xScale(v)}, 0)`) //positions on x
            .call(d3.axisLeft(yScale[v])) //calls the y scale
            .append("text")
            .attr("y", -10)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("font-size", "12px")
            .text(v); //labels with each variable name
    });

    //creates the legend by appending g
    const parLegend = svg.append("g")
        .attr("transform", "translate(400, 100)");

    const parLegendHeight = 20;

    //adds the boxes for the generation legend and moves it to right of graph
    parLegend.selectAll("rect")
        .data(genData)
        .enter()
        .append("rect")
        .attr("x", 975)
        .attr("y", (_, i) => i * parLegendHeight)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => parColor(d.generate)); //fills boxes with colors

    //aligns generation text with each box and aligns it right next to each box
    parLegend.selectAll("text")
        .data(genData)
        .enter()
        .append("text")
        .attr("x", 1000)
        .attr("y", (_, i) => i * parLegendHeight + 10)
        .attr("font-size", "14px")
        .text(d => `Gen ${d.generate}`);

    //creates the graph title and centers it above the graph
    parallelGroup.append("text")
        .attr("x", pWidth / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("Average Pokemon Stats per Generation");

//catches any errors and gives an error message      
}).catch(function (error){
    console.log(error);
});