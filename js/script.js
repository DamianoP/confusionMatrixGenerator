let stats=document.getElementById("stats");
function analyzeTable(){
    let absoluteCounter=0;
    let diagonalCounter=0;
    let rowTotal=[];
    let columnTotal=[];
    for(let i=0;i<numClasses;i++){
        let row=0;
        let column=0;
        for(let j=0;j<numClasses;j++){
            let local=customParseInt(getValue("absolute"+i+j));
            if(i==j){
                diagonalCounter+=local;
            }
            row+=local;
            column+=customParseInt(getValue("absolute"+j+i));
        }
        rowTotal[i]=row;
        columnTotal[i]=column;
        absoluteCounter+=row;
    }
    return [absoluteCounter,diagonalCounter,rowTotal,columnTotal];
}
function calculateCF(){
    let statsString="<tr>" +
        makeCell("Class Name","className",false)+
        makeCell("Precision","className",false)+
        makeCell("1-Precision","className",false)+
        makeCell("Recall","className",false)+
        makeCell("1-Recall","className",false)+
        makeCell("f1-score","className",false)+
        "</tr>";
    let values=analyzeTable();
    let totalElement=values[0];
    let diagonalValue=values[1];
    let rows=values[2];
    let columns=values[3];
    let macroF1=0;
    let weightedF1=0;
    for(let i=0;i<numClasses;i++){
        let rowTotal=rows[i];
        let columnTotal=columns[i];
        let className=getValue("name"+i);
        statsString+="<tr><td class='className'>"+className+"</td>";
        for(let j=0;j<numClasses;j++){
            let idAbsolute="absolute"+i+j;
            let idPercentage="percentage"+i+j;
            let valueAbsolute=customParseInt(getValue(idAbsolute));
            let percentage=twoDecimal(100*valueAbsolute/totalElement);
            setHTML(idPercentage,percentage+"%<br><span>&nbsp;</span>");
            setValue("absolute"+i+numClasses,rowTotal);
        }

        // last column values
        let precision=customParseInt(getValue("absolute"+i+i))/rowTotal;
        let negative;
        if(precision==0){
            negative=0;
            if(rowTotal>0) negative=1;
        }
        else negative=1-precision;
        statsString+=makeCell(precision);
        statsString+=makeCell(negative);
        let positive="<span style='color: green'>"+twoDecimal(100*precision)+"%</span>";
        negative="<span style='color: red'>"+twoDecimal(100*negative)+"%</span>";
        setHTML("percentage"+i+numClasses,positive+"<br>"+negative);
        setHTML("label"+i,className);

        //last row values
        let recall=customParseInt(getValue("absolute"+i+i))/columnTotal;
        if(recall==0){
            negative=0;
            if(rowTotal>0) recall=1;
        }
        else negative=1-recall;
        statsString+=makeCell(recall);
        statsString+=makeCell(negative);
        positive="<span style='color: green'>"+twoDecimal(100*recall)+"%</span>";
        negative="<span style='color: red'>"+twoDecimal(100*negative)+"%</span>";
        setHTML("sumColumnAbsolute"+i,"<input type='text' value='"+columnTotal+"'>");
        setHTML("sumColumnPercentage"+i,positive+"<br>"+negative);
        let f1Score=0;
        try{
            f1Score=2*(precision*recall)/(precision+recall);
            macroF1+=f1Score;
            weightedF1+=(f1Score*columnTotal);
        }catch(e){
            f1Score="nan";
        }
        statsString+=makeCell(f1Score)+"<tr>";
    }

    let accuracy=diagonalValue/totalElement;
    let negative;
    if(accuracy==0){
        negative=0;
        if(totalElement>0) negative=1;
    }
    else negative=1-accuracy;
    statsString+="<tr>" +
        makeCell("Accuracy","className",false)+
        makeCell(accuracy,"",true,5)+
        "</tr>" +
        "<tr>" +
        makeCell("Misclassification Rate","className",false)+
        makeCell(negative,"",true,5)+
        "</tr>"+
        "<tr>" +
        makeCell("Macro-F1","className",false)+
        makeCell(macroF1/numClasses,"",true,5)+
        "</tr>"+
        "<tr>"+
        makeCell("Weighted-F1","className",false)+
        makeCell(weightedF1/totalElement,"",true,5)+
        "</tr>";


    let percentageFinal="<span style='color: green'>"+twoDecimal(100*accuracy)+"%</span>";
    negative="<span style='color: red'>"+twoDecimal(100*negative)+"%</span>";
    setHTML("absoluteFinal","<input type='text' value='"+diagonalValue+" / "+totalElement+"'>");
    setHTML("percentageFinal",percentageFinal+"<br>"+negative);
    //backupData();
    printStats(statsString);
    console.log("operation completed");
}
function customParseInt(value){
    let x=parseInt(value);
    if(isNaN(x)) x=0;
    return x;
}
function twoDecimal(value){
    return customParseInt(100*value)/100;
}
function downloadImage(i){
    $('input[type=text]').addClass('paddingTop');
    let CMname=document.getElementById("CMname").value.toLowerCase().replace(/\s/g, "");
    let id="#CM";
    if(i==1){
        CMname+="table";
    }else if(i==2){
        CMname+="stats";
        id="#stats";
    }else{

    }
    html2canvas(
        document.querySelector(id),
        {scale:4}
    ).then(function(canvas) {
        saveAs(canvas.toDataURL("image/png"), CMname+'.png');
        $('input[type=text]').removeClass('paddingTop');
    });
}
function saveAs(uri, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        link.href = uri;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        window.open(uri);
    }
}
function backupData(){
    let storage=[];
    storage[0]=numClasses;
    storage[1]=document.getElementById("CM").innerHTML;
    localStorage.setItem("confusionMatrixBackupv2",JSON.stringify(storage));
    console.log(storage);
}
function reloadData(){
    if(localStorage.getItem("confusionMatrixBackupv2")!=null && localStorage.getItem("confusionMatrixBackupv2")!=""){
        let table=JSON.parse(localStorage.getItem("confusionMatrixBackupv2"));
        numClasses=table[0];
        nofcl.value=numClasses;
        document.getElementById("CM").innerHTML=table[1];
    }
}
function autoStart(){
    setInterval(function (){
        calculateCF();
    },1000);
}
function getValue(id){
    return document.getElementById(id).value;
}
function setHTML(id,value){
    document.getElementById(id).innerHTML=value;
}
function setValue(id,value){
    document.getElementById(id).value=value;
}
function printStats(data){
    stats.innerHTML=data;
}
function customDecimal(value,numberOfDigit){
    let x=10**numberOfDigit;
    return customParseInt(x*value)/x;
}
function makeCell(value,className="",number=true,span=0){
    if(number) value=customDecimal(value,4);
    return "<td colspan='"+span+"' class='"+className+"'>"+value+"</td>";
}
function makeString(name,value,number=true){
    if(number)
        return name+": "+twoDecimal(value)+"<br>";
    else
        return name+": "+value+"<br>";
}
//reloadData();
//autoStart();
calculateCF();
