'use client';

import { FilePond } from 'react-filepond';
import NavBar from '../component/navbar';
import 'filepond/dist/filepond.min.css';

export default function Home() {

    return (
        <main>
            <NavBar />
            <div className='flex-col items-center justify-between p-24'>
                <FilePond
                    server={{
                        url: "/api/upload"
                    }}
                />
            </div>
        </main>

    );
}