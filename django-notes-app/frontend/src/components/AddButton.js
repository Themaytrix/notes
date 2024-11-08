import React from "react"
import { Link } from "react-router-dom"
import {ReactComponent as AddIcon } from "../assets/add.svg"

export default function AddButton(){

    return(
        <Link to="/notes/new" className="floating-button">
            <AddIcon/>
        </Link>
    )
}