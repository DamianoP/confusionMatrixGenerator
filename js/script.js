let stats=document.getElementById("stats");
let cfPrecision=2;
let statsPrecision=4;
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
        makeCell("False Negative Rate (FNR)","className",false)+
        makeCell("F1 score","className",false)+
        makeCell("Specificity (TNR)","className",false)+
        makeCell("False Positive Rate (FPR)","className",false)+
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
        let classCount=customParseInt(getValue("absolute"+i+i));
        for(let j=0;j<numClasses;j++){
            let idAbsolute="absolute"+i+j;
            let idPercentage="percentage"+i+j;
            let valueAbsolute=customParseInt(getValue(idAbsolute));
            let percentage=trimDecimals(100*valueAbsolute/totalElement);
            if(totalElement==0){
                percentage=0;
            }
            setHTML(idPercentage,percentage+"%<br><span>&nbsp;</span>");
            setValue("absolute"+i+numClasses,rowTotal);
        }

        // --- CALCOLO RECALL (Sensitivity) ---
        let recall=classCount/columnTotal;
        let negative;     
        let negativeBottom;   
        if(isNaN(recall)){
            recall=0;
        }
        if(recall==0){
            negative=0;
            if(columnTotal>0) negative=1;
        }
        else negative=1-recall;
        
        // Salviamo il False Negative Rate (1-Recall) in negativeBottom
        negativeBottom=negative; 

        // --- CALCOLO PRECISION ---
        let precision=classCount/rowTotal;
        negative=0;
        if(isNaN(precision)){
            precision=0;
        }
        if(precision==0){
            negative=1;
            if(rowTotal>0) {precision=0;}
        }
        else negative=1-precision; 

        if (rowTotal==0){
            negative=0;
        }
        let negativeRight="<span style='color: red'>"+trimDecimals(100*negative)+"%</span>";
        let positive="<span style='color: green'>"+trimDecimals(100*precision)+"%</span>";
        setHTML("percentage"+i+numClasses,positive+"<br>"+negativeRight);
        setHTML("label"+i,className);


        // --- CREAZIONE RIGHE TABELLA ---
        statsString+=makeCell(precision);
        statsString+=makeCell(negative); // (1 - Precision)
        statsString+=makeCell(recall);
        
        // negativeBottom che contiene il False Negative Rate (1-Recall)
        statsString+=makeCell(negativeBottom); 

        positive="<span style='color: green'>"+trimDecimals(100*recall)+"%</span>";
        // negativeBottom è (1-Recall), ma per la colonna somma in basso vogliamo (1-Recall) o (1-Precision)?
        // Solitamente nella matrice visuale:
        // Colonna finale (destra) = Precision e 1-Precision
        // Riga finale (basso) = Recall e 1-Recall
        let negativeForColumnSum = negativeBottom; 
        let negativeHtml="<span style='color: red'>"+trimDecimals(100*negativeForColumnSum)+"%</span>";
        setHTML("sumColumnAbsolute"+i,"<input disabled type='text' value='"+columnTotal+"'>");
        setHTML("sumColumnPercentage"+i,positive+"<br>"+negativeHtml);
        
        let f1Score=0;
        if(precision+recall>0){
            f1Score=2*(precision*recall)/(precision+recall);             
        }
        macroF1+=f1Score;
        weightedF1+=(f1Score*rowTotal);
        console.log("weightedF1: "+f1Score+" * "+rowTotal+" = "+weightedF1);
        statsString+=makeCell(f1Score);

        // --- CALCOLO SPECIFICITY e FPR ---
        let TN = totalElement-columnTotal-(rowTotal-classCount);
        
        // FP deriva dalle righe (Predicted) meno i True Positive
        let FP = rowTotal - classCount; 
        
        // La Specificity è TN / (TN + FP) cioè TN / (Tutti i Negativi Reali)
        let specificityDenominator = TN + FP;
        let specificity = 0;
        
        if(specificityDenominator > 0){
             specificity = TN / specificityDenominator;
        } else {
             specificity = 0; // O 1, dipende da come gestire il caso limite divisione per zero
        }
        
        if(isNaN(specificity)){
            specificity=0;
        }
        let FPR = 1-specificity;
        statsString+=makeCell(specificity);
        statsString+=makeCell(FPR);

        statsString+="</tr><tr>";

        let TNR = TN/(totalElement-columnTotal); 
    }

    let accuracy=diagonalValue/totalElement;
    let negative;
    if(accuracy==0){
        negative=0;
        if(totalElement>0) negative=1;
    }
    else negative=1-accuracy;
    
    if(isNaN(accuracy)){
        accuracy=0;
    }    
    if(isNaN(negative)){
        negative=0;
    }    
    if(totalElement==0){
        weightedF1=0;
    }else{
        weightedF1=weightedF1/totalElement;
    }
    let span=0;
    statsString+="</tr>";
    let statsString2="<tr>" +
        makeCell("Accuracy","className",false)+
        makeCell(accuracy,"",true,span)+
        "</tr>" +
        "<tr>" +
        makeCell("Misclassification Rate","className",false)+
        makeCell(negative,"",true,span)+
        "</tr>"+
        "<tr>" +
        makeCell("Macro-F1","className",false)+
        makeCell(macroF1/numClasses,"",true,span)+
        "</tr>"+
        "<tr>"+
        makeCell("Weighted-F1","className",false)+
        makeCell(weightedF1,"",true,span)+

    "</tr>";


    let percentageFinal="<span style='color: green'>"+trimDecimals(100*accuracy)+"%</span>";
    negative="<span style='color: red'>"+trimDecimals(100*negative)+"%</span>";
    setHTML("absoluteFinal","<input disabled type='text' value='"+diagonalValue+" / "+totalElement+"'>");
    setHTML("percentageFinal",percentageFinal+"<br>"+negative);
    //backupData();
    printStats(statsString,0);
    printStats(statsString2,1);
    console.log("operation completed");
}
function customParseInt(value){
    let x=parseInt(value);
    if(isNaN(x)) x=0;
    return x;
}
function trimDecimals(value){
    return value.toFixed(cfPrecision);
}
function downloadImage(i){
    $('input[type=text]').addClass('paddingTop');
    let CMname=document.getElementById("CMname").value.toLowerCase().replace(/\s/g, "");
    let id="#CM";
    if(i==1){
        //CMname+="table";
    }else if(i==2){
        CMname+="stats";
        id="#stats";
    }else if(i==3){
        CMname+="stats2";
        id="#stats2";
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
function printStats(data,t){
    if(t==0){
        stats=document.getElementById("stats");
        stats.innerHTML=data;
    }
    else if(t==1){
        stats=document.getElementById("stats2");
        stats.innerHTML=data;
    }
    console.log(data);
}
function customDecimal(value,numberOfDigit){
    //let x=10**numberOfDigit;
    //return customParseInt(x*value)/x;
    return value.toFixed(numberOfDigit);
}
function makeCell(value,className="",number=true,span=0){
    if(number) value=customDecimal(value,statsPrecision);
    return "<td colspan='"+span+"' class='"+className+"'>"+value+"</td>";
}
function makeString(name,value,number=true){
    if(number)
        return name+": "+trimDecimals(value)+"<br>";
    else
        return name+": "+value+"<br>";
}
function changePrecision(){
    let newValue=document.getElementById("CFprecision").value;
    if(newValue){
        cfPrecision=parseInt(newValue);
        calculateCF();
    }
}
function changeStatPrecision(){
    let newValue=document.getElementById("statprecision").value;
    if(newValue){
        statsPrecision=parseInt(newValue);
        calculateCF();
    }
}
//reloadData();
//autoStart();
calculateCF();
