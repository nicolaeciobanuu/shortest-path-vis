import "./style.css";
const Node = (props) => {
    const {col, row, isFinish, isStart, isWall, onMouseDown, onMouseEnter, onMouseUp} = props;
    const extraClassName =isFinish
        ? "node-finish"
        :isStart
        ? "node-start"
        :isWall
        ? "node-wall"
        :"";
    return (
            <td
            id={`node-${row}-${col}`}
            className={`node ${extraClassName}`}
            onMouseDown={()=>onMouseDown(row,col)}
            onMouseEnter={()=>onMouseEnter(row,col)}
            onMouseUp={()=>onMouseUp()}
            />
     );
}
 
export default Node;