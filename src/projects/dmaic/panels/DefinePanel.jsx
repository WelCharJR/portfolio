import Field from "../components/Field.jsx";
import CtqTree from "../components/CtqTree.jsx";

export default function DefinePanel() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div className="card">
        <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Termo de abertura do projeto</div>
        <Field label="Problema" text="8,4% das operações de torque na Junção de Asa (Bay 4) resultam em não conformidade, gerando retrabalho e risco de atraso na entrega." />
        <Field label="Meta" text="Reduzir a taxa de NC de torque de 8,4% para 2% em 90 dias, sem adicionar etapas ao processo." />
        <Field label="Escopo" text="Estação Bay 4 — pontos de fixação da longarina e da nervura, aeronave E195-E2 MSN 7734." />
        <Field label="Equipe" text="Green Belt (condutor), sponsor Black Belt, operadores da estação, metrologia, qualidade." />
        <Field
          label="Impacto financeiro projetado"
          text="Cada NC gera em média 1,8h de retrabalho. Na taxa atual, o custo estimado é de ~R$ 46 mil/trimestre — só em retrabalho, sem contar risco de atraso de entrega."
          accent
          last
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card">
          <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Árvore CTQ</div>
          <CtqTree />
        </div>
        <div className="card">
          <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>SIPOC</div>
          <table className="dmaic-table">
            <thead><tr><th>Fornec.</th><th>Entrada</th><th>Processo</th><th>Saída</th><th>Cliente</th></tr></thead>
            <tbody>
              <tr>
                <td>Metrologia</td>
                <td>Chave calibrada</td>
                <td>Torqueamento</td>
                <td>Junta conforme</td>
                <td>Montagem final</td>
              </tr>
              <tr>
                <td>Almoxarifado</td>
                <td>Fixadores</td>
                <td>Inspeção visual</td>
                <td>Registro em OS</td>
                <td>Qualidade</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
