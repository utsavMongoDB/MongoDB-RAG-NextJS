'use client';

import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import { useState } from 'react';
import NavBar from '../component/navbar';

export default function Home() {
    return (
        <main>
            <NavBar />
            <div className='flex-col items-center justify-between p-24'>
                <FilePond
                    server="/api"
                />
            </div>
        </main>
    );
}