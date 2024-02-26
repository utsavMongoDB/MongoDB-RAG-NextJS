'use client';

import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import NavBar from '../component/navbar';
import { useState } from 'react';
import { NextRequest } from 'next/server';

export default function Home() {
   
    return (
        <main>
            <NavBar />
            <div className='flex-col items-center justify-between p-24'>
                <FilePond
                    server={{
                        url : "/api",
                        process: {
                            url: "/",
                            onload: (response) => {
                                console.log("res - ", response)
                                return response
                            }
                        }
                    }}
                />
            </div>
        </main>

    );
}