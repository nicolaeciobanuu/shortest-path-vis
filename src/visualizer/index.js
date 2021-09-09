import Node from "./node";
import {useState, useEffect} from "react";
import styled from "styled-components";
import {dijkstra} from '../algs/dijkstra';
import {dfs} from '../algs/dfs';
import { bfs } from '../algs/bfs';
const GridContainer = styled.table`
    margin: 2% auto;
`
const Grid = styled.tbody`
    white-space: pre;
`
const Button = styled.button`
    margin: 2px;
    border-radius: 8px;
    border: none;
    background-color: #192736;
    color: white;
    padding: 8px 15px;
    font-size: 1.3rem;
    &:hover{
        cursor: pointer;
        background-color: #576675;
    }
`
const ButtonsGroup = styled.div`
    display: flex;
    justify-content: center;
`
const Vizualizer = () => {
    const [grid, setGrid] = useState([]);
    const [startNodeRow, setStartNodeRow] = useState(5);
    const [finishNodeRow, setFinishNodeRow] = useState(5);
    const [startNodeCol, setStartNodeCol] = useState(5);
    const [finishNodeCol, setFinishNodeCol] = useState(15);
    const [mouseIsPressed, setMouseIsPressed] = useState(false);
    const [rowCount,setRowCount] = useState(25);
    const [colCount,setColCount] = useState(35);
    const [isRunning, setIsRunning] = useState(false);
    const [isStartNode, setIsStartNode] = useState(false);
    const [isFinishNode, setIsFinishNode] = useState(false);
    const [isWallNode, setIsWallNode] = useState(false);
    const [currRow, setCurrRow] = useState(0);
    const [currCol, setCurrCol] = useState(0);

    useEffect(() => {
        const grid = getInitialGrid();
        setGrid(grid);
    },[]);
    const toggleIsRunnig = () => {
        setIsRunning(isRunning => !!isRunning);
    }
    const getInitialGrid = (rows = rowCount, cols = colCount)=>{
        const initialGrid = [];
        for (let row = 0; row < rows; ++row){
            const currentRow = [];
            for (let col = 0; col < cols; ++col){
                currentRow.push(createNode(row, col));
            }
            initialGrid.push(currentRow);
        }
        return initialGrid;
    }
    const createNode = (row, col) => {
        return {
            row,
            col,
            isStart:
                row === startNodeRow && col === startNodeCol,
            isFinish:
                row === finishNodeRow && col === finishNodeCol,
            distance: Infinity,
            distanceToFinishNode:
                Math.abs(finishNodeRow - row) + Math.abs(finishNodeCol - col),
            isVisited: false,
            isWall: false,
            previousNode: null,
            isNode: true,
        };
    }
    const handleMouseDown = (row, col) => {
        if (!isRunning) {
            if (isGridClear()) {
                const element = document.getElementById(`node-${row}-${col}`).className;
                if ( element === 'node node-start') {
                    setMouseIsPressed(true);
                    setIsStartNode(true);
                    setCurrRow(row);
                    setCurrCol(col);
                }
                else if (element === 'node node-finish') {
                    setMouseIsPressed(true);
                    setIsFinishNode(true);
                    setCurrRow(row);
                    setCurrCol(col);
                }
                else {
                    const newGrid = getNewGridWithWallToggle(grid, row, col);
                    setGrid(newGrid);
                    setMouseIsPressed(true);
                    setIsWallNode(true);
                    setCurrRow(row);
                    setCurrCol(col);
                }
            } else {
                clearGrid();
            }
        }
    }
    const isGridClear = ()=>{
        for (const row of grid) {
            for (const node of row) {
                const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`,).className;
                if (nodeClassName === "node node-visited" || nodeClassName === "node node-shortest-path") {
                    return false;
                }
            }
        }
        return true;
    }
    const handleMouseEnter = (row, col) => {
        if (!isRunning) {
            if (mouseIsPressed) {
                const nodeClassName = document.getElementById(`node-${row}-${col}`).className;
                if (isStartNode) {
                    if (nodeClassName !== "node node-wall") {
                        const prevStartNode = grid[currRow][currCol];
                        prevStartNode.isStart = false;
                        document.getElementById(`node-${currRow}-${currCol}`,).className = "node";
                        setCurrRow(row);
                        setCurrCol(col);
                        const currStartNode = grid[row][col];
                        currStartNode.isStart = true;
                        document.getElementById(`node-${row}-${col}`).className = 'node node-start';
                    }
                    setStartNodeRow(row);
                    setStartNodeCol(col);
                }
                else if(isFinishNode){
                    if (nodeClassName !== "node node-wall") {
                        const prevFinishNode = grid[currRow][currCol];
                        prevFinishNode.isFinish = false;
                        document.getElementById(`node-${currRow}-${currCol}`,).className = 'node';
                        setCurrRow(row);
                        setCurrCol(col);
                        const currFinishNode = grid[row][col];
                        currFinishNode.isFinish = true;
                        document.getElementById(`node-${row}-${col}`,).className = 'node node-finish';
                    }
                    setFinishNodeRow(row);
                    setFinishNodeCol(col);
                }
                else if (isWallNode) {
                    const newGrid = getNewGridWithWallToggle(grid, row, col);
                    setGrid(newGrid);
                }
            }
        }
    }
    const handleMouseUp = (row, col) => {
        if (!isRunning) {
            setMouseIsPressed(false);
            if (isStartNode) {
                const newIsStartNode = !isStartNode;
                setIsStartNode(newIsStartNode);
                setStartNodeRow(row);
                setStartNodeCol(col);
            }
            else if (isFinishNode) {
                const newIsFinishNode = !isFinishNode;
                setIsFinishNode(newIsFinishNode);
                setFinishNodeRow(row);
                setFinishNodeCol(col);
            }
            getInitialGrid();
        }
    }
    const handleMouseLeave = () => {
        if (isStartNode) {
            const newIsStartNode = !isStartNode;
            setIsStartNode(newIsStartNode);
            setMouseIsPressed(false);
        }
        else if (isFinishNode) {
            const newIsFinishNode = !isFinishNode;
            setIsFinishNode(newIsFinishNode);
            setMouseIsPressed(false);
        }
        else if (isWallNode) {
            const newIsWallNode = !isWallNode;
            setIsWallNode(newIsWallNode);
            setMouseIsPressed(false);
            getInitialGrid();
        }
    }
    const clearGrid = () => {
        if (!isRunning) {
            const newGrid = grid.slice();
            for (const row of newGrid) {
                for (const node of row) {
                    let nodeClassName = document.getElementById(`node-${node.row}-${node.col}`,).className;
                    if (
                        nodeClassName !== 'node node-start' &&
                        nodeClassName !== 'node node-finish' &&
                        nodeClassName !== 'node node-wall')
                    {
                        document.getElementById(`node-${node.row}-${node.col}`).className = 'node';
                        node.isVisited = false;
                        node.distance = Infinity;
                        node.distanceToFinishNode = Math.abs(finishNodeRow - node.row) + Math.abs(finishNodeCol - node.col);
                    }
                    if (nodeClassName === 'node node-finish') {
                        node.isVisited = false;
                        node.distance = Infinity;
                        node.distanceToFinishNode = 0;
                    }
                    if (nodeClassName === 'node node-start') {
                        node.isVisited = false;
                        node.distance = Infinity;
                        node.distanceToFinishNode = Math.abs(finishNodeRow - node.row) + Math.abs(setFinishNodeCol - node.col);
                        node.isStart = true;
                        node.isWall = false;
                        node.previousNode = null;
                        node.isNode = true;
                    }
                }
            }
        }
    }
    const clearWalls = () => {
        if (!isRunning) {
            const newGrid = grid.slice();
            for (const row of newGrid) {
                for (const node of row) {
                    let nodeClassName = document.getElementById(`node-${node.row}-${node.col}`,).className;
                    if (nodeClassName === "node node-wall") {
                        document.getElementById(`node-${node.row}-${node.col}`).className = 'node';
                        node.isWall = false;
                    }
                }
            }
        }
    }
    const visualize = (alg) => {
        if (!isRunning) {
            clearGrid();
            toggleIsRunnig();
            const startNode = grid[startNodeRow][startNodeCol];
            const finishNode = grid[finishNodeRow][finishNodeCol];
            let visitedNodes;
            switch (alg) {
                case 'Dijkstra':
                    visitedNodes = dijkstra(grid, startNode, finishNode);
                    break;
                case 'BFS':
                    visitedNodes = bfs(grid, startNode, finishNode);
                    break;
                case 'DFS':
                    visitedNodes = dfs(grid, startNode, finishNode);
                    break;
                default:
                    break;
                    //nu ar fi cazul
            }
            const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
            nodesInShortestPathOrder.push("end");
            animate(visitedNodes, nodesInShortestPathOrder);
        }
    }
    const animate=(visitedNodes, nodesInShortestPathOrder)=>{
        for (let i = 0; i <=visitedNodes.length; ++i){
            if (i === visitedNodes.length) {
                setTimeout(() => {
                    animateShortestPath(nodesInShortestPathOrder);
                }, 10 * i);
                return;
            }
            setTimeout(() => {
                const node = visitedNodes[i];
                const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`,).className;
                if (
                    nodeClassName !== 'node node-start' &&
                    nodeClassName !== 'node node-finish') {
                    document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-visited';
                    
                }
            }, 10 * i);
        }
    }
    const animateShortestPath = (nodesInShortestPathOrder) => {
        for (let i = 0; i < nodesInShortestPathOrder.length; ++i){
            if (nodesInShortestPathOrder[i] === "end") {
                setTimeout(() => {
                    toggleIsRunnig();
                }, i * 50);
            }
            else {
                setTimeout(() => {
                    const node = nodesInShortestPathOrder[i];
                    const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`,).className;
                    if (
                        nodeClassName !== 'node node-start' &&
                        nodeClassName !== 'node node-finish') {
                        document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-shortest-path';
                        
                    }
                }, i * 40);
            }
        }
    }
    const getNodesInShortestPathOrder=(finishNode)=>{
        const nodesInShortestPathOrder = [];
        let currentNode = finishNode;
        while (currentNode !== null) {
            nodesInShortestPathOrder.unshift(currentNode);

            currentNode = currentNode.previousNode;
        }
        return nodesInShortestPathOrder;
    }
    const getNewGridWithWallToggle = (grid, row, col) => {
        const newGrid = grid.slice();
        const node = newGrid[row][col];
        if (!node.isStart && !node.isFinish && node.isNode) {
            const newNode = {
                ...node,
                isWall: !node.isWall,
            };
            newGrid[row][col] = newNode;
        }
        return newGrid;
    }
    const newGrid = grid;
    const newMouseIsPressed = mouseIsPressed;
    return (
        <div>
            <GridContainer
            onMouseLeave={() => handleMouseLeave()}>
                <Grid>
                    {newGrid.map((row, rowId) => {
                        return (
                                <tr key={rowId}>
                                {row.map((node, nodeId) => {
                                   
                                    const { row, col, isFinish, isStart, isWall } = node;
                                    return (
                                        <Node
                                            key={nodeId}
                                            col={col}
                                            isFinish={isFinish}
                                            isStart={isStart}
                                            isWall={isWall}
                                            mouseIsPressed={newMouseIsPressed}
                                            onMouseDown={(row, col) =>
                                                handleMouseDown(row, col)
                                            }
                                            onMouseEnter={(row, col) =>
                                                handleMouseEnter(row, col)
                                            }
                                            onMouseUp={() => handleMouseUp(row, col)}
                                            row={row}
                                        >
                                        </Node>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </Grid>
            </GridContainer>
            <ButtonsGroup>
            <Button
            onClick={()=>clearGrid()}
            >Sterge Drum</Button>
            <Button
            onClick={()=>clearWalls()}
            >Sterge obstacole</Button>
            <Button
            onClick={()=>visualize("Dijkstra")}
            >Dijkstra</Button>
            <Button
            onClick={()=>visualize("BFS")}
            >BFS</Button>
            <Button
            onClick={()=>visualize("DFS")}
            >DFS</Button>
            </ButtonsGroup>
        </div>
     );
}
 
export default Vizualizer;