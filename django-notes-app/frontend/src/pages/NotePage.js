import { useParams, redirect } from "react-router-dom"
import React,{ useEffect,useState } from "react"
import {ReactComponent as Arrowleft}from "../assets/arrow-left.svg"
import { Link } from "react-router-dom"


export default function NotePage(){
    // getting id from url key
    const {id} = useParams(null)

    // get and setNotes. Allow notes to be empty at the jump
    const [note,setNote] = useState()
    console.log(note)

    useEffect(()=>{
        getNote()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    // fetching note from the api and parse
    const getNote = async ()=>{
        if (id === 'new') return
        let response = await fetch(`/api/notes/${id}`)
        let data = await response.json()
        setNote(data)
    }
    // creating notes
    const createNote = async () => {
        fetch(`/api/notes/create`,
        {
            method: 'POST',
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(note)
        })
    }
    // updating notes
    const updateNote = async () => {
        fetch(`/api/notes/${id}/update`,
        {
            method : "PUT",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(note)
        })
    }

    // handling update submit
    const handleSubmit = () => {
        if(id !== "new" && note.body !== ""){
            console.log("update")
            updateNote()
        }else if( id === 'new' && note.body !== null){
            createNote()
        }
        else if(note.body ===""){
            console.log("delete")
            deleteNote()
        }

    }

    //delet note
    const deleteNote = async () => {
        fetch(`/api/notes/${id}/delete`,
        {
            method: 'DELETE',
            headers: {
                "Content-Type" : "application/json"
            }
        })
    }



    const updateText = (e) => {
        setNote({...note,
        'body': e.target.value })
    }

    return(
        <div className="note">
            <div className="note-header">
                <h3>
                    <Link to={"/"}>
                        <Arrowleft onClick={handleSubmit} />
                    </Link>
                    
                </h3>
                <Link to={"/"}>
                    {id !== 'new' ? ( <button onClick={deleteNote}>Delete</button>):(<button onClick={handleSubmit}>Done</button>)}
                   </Link>
                
            </div>
            <textarea onChange={updateText} value={note?.body}></textarea>
        </div>
    )
}