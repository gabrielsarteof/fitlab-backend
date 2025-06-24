//Matheus Cardoso
import { Estado } from "../models/Estado.js";

class EstadoService {

    static async findAll() {
        return await Estado.findAll({
            include: [
                { association: 'cliente', attributes: ['id', 'nome'] },
                { association: 'nutricionista', attributes: ['id', 'nome'] }
            ]
        });
    }


    static async findByPk(req) {
        const { id } = req.params;
        return await Estado.findByPk(id, {
            include: [
                { association: 'cliente', attributes: ['id', 'nome'] },
                { association: 'nutricionista', attributes: ['id', 'nome'] }
            ]
        });
    }


    static async create(req) {
        const { data, peso, altura, taxa_gordura, circunferencia_cintura, circunferencia_braco, comentarios, cliente, nutricionista } = req.body;

        if (cliente == null) throw 'Cliente invalido!';

        if (nutricionista == null) throw 'Nutricionista invalido!';

        if (await this.verificarRegrasDeNegocio(req)) {
            const obj = await Estado.create({ data, peso, altura, taxa_gordura, circunferencia_cintura, circunferencia_braco, comentarios, cliente_id: cliente.id, nutricionista_id: nutricionista.id });
            return await Estado.findByPk(obj.id, { include: { all: true, nested: true } });
        }
    }

    static async update(req) {
        const { id } = req.params;
        const { data, peso, altura, taxa_gordura, circunferencia_cintura, circunferencia_braco, comentarios, cliente_id, nutricionista_id } = req.body;
        let obj = await Estado.findOne({ where: { id } });

        Object.assign(obj, { data, peso, altura, taxa_gordura, circunferencia_cintura, circunferencia_braco, comentarios, cliente_id, nutricionista_id });
        return await obj.save();
    }

    static async delete(req) {
        const { id } = req.params;
        let obj = await Estado.findByPk(id);
        return await obj.destroy();
    }

    //Implementando as Regras de Negócio da Atualização de Estado
    //RN 1: Não pode ter sido criada uma atualização de estado na mesma semana.
    //RN 2: Limite de 3 atualizações de estado a cada 30 dias
    static async verificarRegrasDeNegocio(req) {
        const { cliente } = req.body;

        const hoje = new Date(req.body.data);

        // RN1: Verificar se já existe uma atualização na mesma semana
        const ultimaSemana = new Date(hoje);
        ultimaSemana.setDate(hoje.getDate() - 7);

        const atualizacaoSemana = await Estado.findOne({
            where: {
                cliente,
                data: {
                    [Op.between]: [ultimaSemana, hoje],
                },
            },
        });

        if (atualizacaoSemana) {
            throw new Error('Já existe uma atualização de estado nesta semana.');
        }

        // RN2: Verificar se existem mais de 3 atualizações nos últimos 30 dias
        const trintaDiasAtras = new Date(hoje);
        trintaDiasAtras.setDate(hoje.getDate() - 30);

        const atualizacoesUltimos30Dias = await Estado.count({
            where: {
                cliente,
                data: {
                    [Op.between]: [trintaDiasAtras, hoje],
                },
            },
        });

        if (atualizacoesUltimos30Dias >= 3) {
            throw new Error('Limite de 3 atualizações de estado nos últimos 30 dias atingido.');
        }
    }

    static async evolucaoCliente(req) {
        const { cliente_id } = req.params;
        const objs = await sequelize.query("SELECT * FROM estado WHERE cliente_id = :cliente_id ORDER BY data ASC", { replacements: { cliente_id: cliente_id }, type: QueryTypes.SELECT });
        return objs;
    }

    static async estadosMaisRecentes(req) {
        const objs = await sequelize.query("SELECT DISTINCT ON (cliente_id) * FROM estado ORDER BY cliente_id, data DESC", { type: QueryTypes.SELECT });
        return objs;
    }

}

export { EstadoService };