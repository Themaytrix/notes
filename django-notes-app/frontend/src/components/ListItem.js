import { Link } from "react-router-dom"

// getting title
const getTitle = (note) => {

    let title = note.body.split('\n')[0]
    if(title.length > 45){
        return title.slice(0,45)
    }
    return title
}

const getDate = (note) =>{
    return new Date(note.updated).toLocaleDateString()
}


export default function ListItem(prop){

  
    return(
        <Link to={`/notes/${prop.note.id}`}>
            <div className="notes-list-item">
                <h3>{getTitle(prop.note)}</h3>
                <p><span>{getDate(prop.note)}</span></p>
            </div>
           
        </Link>
    )

}