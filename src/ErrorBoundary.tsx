import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export class ErrorBoundary extends Component<{children:ReactNode},{error?:Error}> {
  state:{error?:Error}={}
  static getDerivedStateFromError(error:Error){return{error}}
  componentDidCatch(error:Error,info:ErrorInfo){console.error('SNB UI boundary',error,info.componentStack)}
  render(){if(!this.state.error)return this.props.children;return <main className="fatal-boundary"><div><span><AlertTriangle size={25}/></span><small>SNB RECOVERY LAYER</small><h1>A interface encontrou uma falha isolada.</h1><p>Nenhuma ação foi assumida como concluída. Recarregue a experiência; missões e dados persistentes permanecem no backend.</p><pre>{this.state.error.message}</pre><button onClick={()=>location.reload()}><RefreshCw size={15}/>Recarregar com segurança</button></div></main>}
}
