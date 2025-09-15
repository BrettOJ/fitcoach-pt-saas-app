using Confluent.Kafka;
using System.Text.Json;

namespace FitCoach.Common.Messaging;

public class KafkaProducer : IDisposable
{
    private readonly IProducer<Null, string> _producer;

    public KafkaProducer(string bootstrapServers)
    {
        var cfg = new ProducerConfig { BootstrapServers = bootstrapServers };
        _producer = new ProducerBuilder<Null, string>(cfg).Build();
    }

    public async Task ProduceAsync<T>(string topic, T message)
    {
        var payload = JsonSerializer.Serialize(message);
        await _producer.ProduceAsync(topic, new Message<Null, string> { Value = payload });
    }

    public void Dispose()
    {
        _producer?.Flush(TimeSpan.FromSeconds(5));
        _producer?.Dispose();
    }
}
