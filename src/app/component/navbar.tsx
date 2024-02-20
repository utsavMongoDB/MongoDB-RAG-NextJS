"use client";
import Link from 'next/link';

const NavBar: React.FC = () => {
    return (
        <nav style={{ backgroundColor: '#00674a', padding: '1rem' }}>
            <ul style={{ listStyleType: 'none', margin: 10, padding: 0 }}>
                <img src='./favicon.ico' width={"3%"}  style={{ display: 'inline', marginLeft: '1rem' }}>
                </img>
                <li style={{ display: 'inline', marginLeft: '5rem' }}>
                    <Link href="/">Home</Link>
                </li>
                <li style={{ display: 'inline', marginLeft: '2rem' }}>
                    <Link href="/ask">Ask</Link>
                </li>
                <li style={{ display: 'inline', marginLeft: '2rem' }}>
                    <Link href="/teach">Teach</Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;