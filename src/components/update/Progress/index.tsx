import React from 'react'

const Progress: React.FC<React.PropsWithChildren<{percent?: number}>> = props => {
    const { percent = 0 } = props

    return (
        <progress 
            className="progress progress-primary w-full" 
            value={percent} 
            max="100">
        </progress>
    )
}

export default Progress